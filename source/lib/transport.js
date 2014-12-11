// transport.js
var util = require('util'),
    url = require('url'),
    events = require('events');

// tcp, tls and websocket
var transport = function (address, type) {
    events.EventEmitter.call(this);
    var self = this;
    
    this.addressParts = url.parse(address);
    if (this.addressParts.protocol.toLowerCase() == "amqp:") {
        type = type || "net";
        this.addressParts.port = this.addressParts.port || 5672;
    } else if (this.addressParts.protocol.toLowerCase() == "amqps:") {
        type = type || "tls";
        this.addressParts.port = this.addressParts.port || 5671;
    }
    
    if (this.addressParts.auth) {
        var tmp = this.addressParts.auth.split(":");
        this.addressParts.user = tmp[0];
        this.addressParts.password = tmp[1];
    }
    
    var options = {
        fd: null,
        allowHalfOpen: false,
        readable: true,
        writable: true
    };
    
    switch (type) {
        case "tls":
            this.underly = require("tls");
            break;
        case "websocket":
            //
            this.underly = require("net");
            break;
        case "net":
        default:
            this.underly = require("net");
            break;
    }
    
    this.underly = this.underly.connect(this.addressParts.port, this.addressParts.hostname, function () {
        self.underly.on("data", function (data) {
            // by pass to the event
            self.emit("data", data);
        });
        
        self.underly.on("close", function () {
            self.emit("close");
        });
        
        self.underly.on("error", function (error) {
            self.emit("error", error);
        });
    });
};

util.inherits(transport, events.EventEmitter);

transport.prototype.close = function () {
    
};

transport.prototype.write = function (buffer, encoding, callback) {
    // do i need to buffer myself?
    if (buffer.offset && buffer.buffer && buffer.offset < buffer.buffer.length) {
        buffer = buffer.buffer.slice(0, buffer.offset);
    }
    this.underly.write(buffer.buffer || buffer, encoding, callback);
};


exports.transport = transport;