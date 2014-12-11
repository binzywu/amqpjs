var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var open = function() {
	describedList.call(this, amqpcodec.Open.code, 10);
};

util.inherits(open, describedList);

open.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.containerId;
	this.fields[1] = this.hostname;
	this.fields[2] = {
		"!type": "uint",
		value: this.maxFrameSize || 0
	};
	this.fields[3] = {
		"!type": "ushort",
		value: this.channelMax || 0
	};
	this.fields[4] = this.idleTimeout || null;
	this.fields[5] = this.outgoingLocales;
	this.fields[6] = this.incomingLocales;
	this.fields[7] = this.offeredCapabilities;
	this.fields[8] = this.desiredCapabilities;
	this.fields[9] = this.properties;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

open.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.containerId = this.fields[0];
	this.hostname = this.fields[1];
	this.maxFrameSize = this.fields[2] || 0xFFFFFFFF;
	this.channelMax = this.fields[3];
	this.idleTimeout = this.fields[4];
	this.outgoingLocales = this.fields[5];
	this.incomingLocales = this.fields[6];
	this.offeredCapabilities = this.fields[7];
	this.desiredCapabilities = this.fields[8];
	this.properties = this.fields[9];
};

open.prototype.toString = function() {
    return "{0} {container-id:{1},host-name:{2},max-frame-size:{3},channel-max:{4}}".format(amqpcodec.Open.name, this.containerId, this.hostname, this.maxFrameSize, this.channelMax);
}

exports.open = open;