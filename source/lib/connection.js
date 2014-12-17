// transportation layer?
var util = require('util'),
    events = require('events'),
    url = require("url"),
    transport = require("./transport").transport,
    fsm = require("./util/fsm").fsm,
    Trace = require("./util/trace").Trace,
    bytebuffer = require("bytebuffer"),
    frame = require('./framing/frame').frame,
    protocolheader = require('./framing/protocolheader').protocolheader,
    open = require('./framing/open').open,
    Close = require('./framing/close').close,
    ErrorFrame = require('./framing/error').error,
    uuid = require("uuid"),
    amqpcodec = require('./amqpcodec').amqpcodec,
    errorcode = require('./errorcode').errorcode,
    frametype = require('./framing/frame').frametype;

var DefaultMaxFrameSize = 16 * 1024;

var State = {
    Start: 0,
    HeaderSent: 1,
    OpenPipe: 2,
    OpenClosePipe: 3,
    HeaderReceived: 4,
    HeaderExchanged: 5,
    OpenSent: 6,
    OpenReceived: 7,
    Opened: 8,
    CloseReceived: 9,
    ClosePipe: 10,
    CloseSent: 11,
    End: 12
};

var connection = function (address) {
    events.EventEmitter.call(this);
    var self = this;
    this.localsessions = [];
    this.remotesessions = [];
    this.maxSessions = 4;
    this.localsessions.length = this.remotesessions.length = this.maxSessions;
    this.maxframesize = DefaultMaxFrameSize;
    this.state = State.Start;
    
    connect();
    
    function connect() {
        self.transport = new transport(address);
        
        self.transport.on("ioerror", function (error) { });
        
        // wrap it in a function otherwise context different.
        self.transport.once("data", function (headerData) {
            // validate header
            var header = new protocolheader(headerData);
            Trace.info("RECV AMQP " + header);
            if (self.state == State.OpenPipe) {
                self.state = State.OpenSent;
            } else if (self.state == State.OpenClosePipe) {
                self.state = State.ClosePipe;
            } else {
                throw new Error("Illegal state: " + self.state);
            }
            
            if (header.major !== 1 || header.minor !== 0 || header.revision !== 0) {
                throw new Error("Only AMQP 1.0.0 is supported.");
            }
                        
            self.transport.on("data", function (data) {
                self._onframe(data);
            });
        });
        
        self.transport.on("error", function (error) {
            console.info(error);
            if (self.state != State.End) {
                self.state = State.End;
                var errorframe = new ErrorFrame();
                errorframe.condition = errorcode.ConnectionForced;
                self._ended(errorframe);
            }
        });
        
        // send header
        // AMQP 0 1 0 0
        var myheader = bytebuffer.fromHex("414d515000010000");
        self.transport.write(myheader);
        self.state = State.OpenPipe;
        Trace.info("SEND AMQP HEADER 1.0.0");
        
        // send open
        var openframe = new open();
        openframe.containerId = uuid.v4();
        openframe.hostname = self.transport.addressParts.hostname;
        openframe.maxFrameSize = self.maxframesize;
        openframe.channelMax = self.maxSessions - 1;
        self._sendCommand(0, openframe);
    }
};

util.inherits(connection, events.EventEmitter);

// notify close, which makes the onclose to be called recursively.
connection.prototype.close = function (error) {
    var newState;
    if (this.state === State.End) {
        this.emit("close", error);
        return;
    } else if (this.state === State.OpenPipe) {
        newState = State.OpenClosePipe;
    } else if (this.state === State.OpenSent) {
        newState = State.ClosePipe;
    } else if (this.state === State.Opened) {
        newState = State.CloseSent;
    } else if (this.state === State.CloseReceived) {
        newState = State.End;
    } else {
        throw new Error("Illegal state in connection close: " + this.state);
    }
    
    this._sendClose(error);
    this.state = newState;
};

connection.prototype._sendClose = function (error) {
    var closeframe = new Close();
    closeframe.error = error;
    this._sendCommand(0, closeframe);
};

connection.prototype._onframe = function (data) {
    if (data) {
        //try {
        var buffer = bytebuffer.wrap(data);
        var receivedFrame = frame.getframe(buffer);
        Trace.info("RECV (ch=" + receivedFrame.channel + ") " + receivedFrame.command);
        
        var code = receivedFrame.command.descriptor.code || receivedFrame.command.descriptor;
        
        // TODO: convert to FSM...
        switch (code) {
            case amqpcodec.Open.code:
                if (this.state === State.OpenSent) {
                    this.state = State.Opened;
                    this.emit("opened");
                } else if (this.state === State.ClosePipe) {
                    this.state = State.CloseSent;
                } else {
                    throw new Error("Illegal state in open: " + this.state);
                }
                
                if (open.maxFrameSize < this.maxframesize) {
                    this.maxframesize = open.maxFrameSize;
                }
                break;
            case amqpcodec.Close.code:
                if (this.state === State.Opened) {
                    // send close and no need to confirm.
                    this._sendClose();
                } else if (this.state === State.CloseSent) {
                    // no-op
                } else {
                    throw new Error("Illegal state: " + this.state);
                }
                
                this.state = State.End;
                this._ended(receivedFrame.command.error);
                break;
            case amqpcodec.Begin.code:
                var session = getSession(this.localsessions, receivedFrame.command.remoteChannel);
                session.begin(receivedFrame.command.remoteChannel, receivedFrame.command);
                this.remotesessions[receivedFrame.channel] = session;
                break;
            case amqpcodec.End.code:
                var session = getSession(this.remotesessions, receivedFrame.channel);
                session.end(receivedFrame.command);
                this.localsessions[session.channel] = null;
                this.remotesessions[receivedFrame.channel] = null;
                break;
            default:
                // session frame
                var session = getSession(this.remotesessions, receivedFrame.channel);
                session.command(receivedFrame.command, buffer);
                break;
        }
        //} catch (ex) {
        //	console.log(ex);
        // TODO: error handling.
        // var error = new error();
        //}
    }
};

connection.prototype._addsession = function (session) {
    this._throwIfClosed("addsession");
    for (var i = 0; i < this.localsessions.length; i++) {
        if (!this.localsessions[i]) {
            this.localsessions[i] = session;
            return i;
        }
    }    ;
    
    throw new Error("Max sessions reached.");
};

connection.prototype._ended = function (error) {
    this.transport && this.transport.close();
    this.close(error);
};

// TODO: support transfer
connection.prototype._sendCommand = function (channel, command, callback) {
    this._throwIfClosed("send");
    var buffer = frame.getbuffer(frametype.amqp, channel, command, 0);
    
    // support buffer too?
    //if (bytebuffer.isByteBuffer(payload)) {
    //    var payloadsize = Math.min(payload.length, this.maxframesize - buffer.offset);
    //    payload.copyTo(buffer, buffer.offset, payload.offset, payloadsize);
    //    payload.offset = payload.offset + payloadsize;
    //    buffer.offset = buffer.offset + payloadsize;
    //}
    
    this.transport.write(buffer, callback);
    Trace.info("SEND (ch=" + channel + ") " + command);
};

connection.prototype._sendTransfer = function (channel, transfer, payload) {

};

connection.prototype._throwIfClosed = function (operation) {
    if (this.state > State.CloseReceived) {
        throw new Error("illegal state: " + this.state + "for operation: " + operation);
    }
};

function getSession(sessions, channel) {
    var session;
    if (channel < sessions.length) {
        session = sessions[channel];
    }
    
    if (!session) {
        throw new Error("Session not found: " + channel);
    }
    
    return session;
}

exports.connection = connection;