var util = require('util'),
    events = require('events');

var SaslTransport = function(innerTransport) {
    events.EventEmitter.call(this);
	this.innerTransport = innerTransport;

	this.innerTransport.on("data", function(data) {
		this.emit("data", data);
	});
};

util.inherits(SaslTransport, events.EventEmitter);

SaslTransport.prototype.open = function (targetHost, saslProfile) {
	saslProfile.open(targetHost, this.innerTransport);
};

SaslTransport.prototype.close = function() {
	this.innerTransport.close();
};

SaslTransport.prototype.write = function(buffer, encoding, callback) {
	this.innerTransport.write(buffer, encoding, callback);
};

exports.SaslTransport = SaslTransport;