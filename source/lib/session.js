// session.js
var util = require('util'),
    events = require('events'),
    linkedlist = require("./util/linkedlist").linkedlist,
    End = require("./framing/end").end,
    begin = require("./framing/begin").begin,
    amqpcodec = require("./amqpcodec").amqpcodec,
    Delivery = require("./delivery").delivery;

var State = {
    Start: 0,
    BeginSent: 1,
    BeginReceived: 2,
    Opened: 3,
    EndPipe: 4,
    EndSent: 5,
    EndReceived: 6,
    End: 7
};

var MaxLinks = 4;

var session = function (connection) {
    this.connection = connection;
    this.locallinks = [];
    this.locallinks.length = MaxLinks;
    this.remotelinks = [];
    this.remotelinks.length = MaxLinks;
    
    // 
    this.incomingList = new linkedlist();
    this.outgoingList = new linkedlist();
    this.nextOutgoingId = 0xFFFFFFFF - 2;
    this.incomingWindow = this.outgoingWindow = 2048;
    this.incomingDeliveryId = 0xFFFFFFFF;
    this.channel = connection._addsession(this);
    
    // send begin
    var beginframe = new begin();
    beginframe.incomingWindow = this.incomingWindow;
    beginframe.outgoingWindow = this.outgoingWindow;
    beginframe.nextOutgoingId = this.nextOutgoingId;
    beginframe.handleMax = 7;
    this.connection._sendcmd(this.channel, beginframe);

    this.state = State.BeginSent;
};

util.inherits(session, events.EventEmitter);

session.prototype.addLink = function (link) {
    this._throwIfEnded("addLink");
    for (var i = 0; i < this.locallinks.length; i++) {
        if (!this.locallinks[i]) {
            this.locallinks[i] = link;
            return i;
        }
    }
    
    throw new Error("Exceed max links.");
};

session.prototype.begin = function (remoteChannel, beginframe) {
    if (this.state === State.BeginSent) {
        this.state = State.Opened;
        this.emit("opened");
    } else if (this.state === State.EndPipe) {
        this.state = State.EndSent;
    } else {
        throw new Error("Illegal state in session begin: " + this.state);
    }
};

session.prototype.end = function (endframe) {
    if (this.state === State.EndSent) {
        this.state = State.End;
    } else if (this.state === State.Opened) {
        // send end
        this._sendend();
        this.state = State.End;
    } else {
        throw new Error("Illegal state in session end: " + this.state);
    }
    
    // onclose
    this.close(endframe.error);
};

session.prototype.close = function (error) {
    // close
    var toRelease = this.outgoingList.clear();
    Delivery.releaseAll(toRelease, error);
    
    if (this.state === State.End) {
        this.emit("close", error);
        return;
    } else if (this.state === State.BeginSent) {
        this.state = State.EndPipe;
    } else if (this.state === State.Opened) {
        this.state = State.EndSent;
    } else if (this.state === State.EndReceived) {
        this.state = State.End;
    } else {
        throw new Error("Illegal state in session close: " + this.state);
    }
    
    this._sendend();
};

session.prototype.command = function (command, buffer) {
    if (this.state >= State.EndReceived) {
        throw new Error("Session is ending or ended.");
    }
    
    var code = command.descriptor.code || command.descriptor;
    if (code == amqpcodec.Attach.code) {
        // handle attach
        this._attach(command);
    } else if (code == amqpcodec.Detach.code) {
        // handle detach
        this._detach(command);
    } else if (code == amqpcodec.Flow.code) {
        // handle flow
        this._flow(command);
    } else if (code == amqpcodec.Transfer.code) {
        // handle transfer
        this._transfer(command, buffer);
    } else if (code == amqpcodec.Dispose.code) {
        // dispose.
        this._dispose(command);
    } else {
        // error
        throw new Error(code + "is not supported.");
    }
};

session.prototype._throwIfEnded = function (operation) {

};

session.prototype._attach = function (command) {
    for (var i = 0; i < this.locallinks.length; i++) {
        var link = this.locallinks[i];
        if (link && link.name === command.linkname) {
            link._onAttach(command.handle, command);
            this.remotelinks[command.handle] = link;
            return;
        }
    }
    
    throw new Error("link :" + command.linkname + " not found.");
};

session.prototype._detach = function (command) {
    var link = this._getlink(command.handle);
    if (link._onDetach(command)) {
        this.locallinks[link.handle] = null;
        this.remotelinks[command.handle] = null;
    }
};

session.prototype._flow = function (command) {
    this.outgoingWindow = command.nextIncomingId + command.incomingWindow - this.nextOutgoingId;
    if (this.outgoingWindow > 0) {
        // delivery
        var delivery = this.outgoingList.head;
        while (delivery) {
            if (delivery.buffer && delivery.buffer.length > 0) {
                break;
            }
            
            delivery = delivery.next;
        }
        
        if (delivery != null) {
            this._writeDelivery(delivery);
        }
    }
    
    if (this.outgoingWindow === 0) {
        return;
    }
    
    if (command.hasHandle) {
        this._getlink(flow.handle)._onFlow(command);
    }
};

session.prototype._transfer = function (command, buffer) {
    if (this.incomingWindow === 0) {
        throw new Error("Window violation, next incoming id: " + this.nextIncomingId);
    }
    
    this.nextIncomingId++;
    this.incomingWindow--;
    var newDelivery = command.hasDeliveryId && command.deliverytId > this.incomingDeliveryId;
    if (newDelivery) {
        this.incomingDeliveryId = command.deliverytId;
    }
    
    var link = this._getlink(command.handle);
    var delivery;
    if (newDelivery) {
        delivery = new Delivery();
        
        if (!delivery.settled) {
            this.incomingList.add(delivery);
        }
    }
    
    link._onTransfer(delivery, command, buffer);
};

session.prototype._dispose = function (command) {

};

session.prototype._writeDelivery = function (delivery) {

};

session.prototype._getlink = function (remoteHandle) {
    var link;
    
    if (remoteHandle < this.remotelinks.length) {
        link = this.remotelinks[remoteHandle];
    }
    
    if (!link) {
        throw new Error("Remote link not found: " + remoteHandle)
    }
    
    return link;
};

session.prototype._sendend = function () {
    this._sendcmd(new End());
};

session.prototype._sendcmd = function (command, callback) {
    this.connection._sendcmd(this.channel, command, callback);
};

// session object.
exports.session = session;