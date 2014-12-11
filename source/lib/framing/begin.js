var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var begin = function() {
	describedList.call(this, amqpcodec.Begin.code, 8);
};

util.inherits(begin, describedList);

begin.prototype.encode = function(buffer, valueonly) {
	if (this.remoteChannel !== undefined && this.remoteChannel !== null) {
		this.fields[0] = {
			"!type": "ushort",
			value: this.remoteChannel
		}
	} else {
		this.fields[0] = null;
	}

	this.fields[1] = {
		"!type": "uint",
		value: this.nextOutgoingId || 0
	};
	this.fields[2] = {
		"!type": "uint",
		value: this.incomingWindow || 0xFFFFFFFF
	};
	this.fields[3] = {
		"!type": "uint",
		value: this.outgoingWindow || 0xFFFFFFFF
	};
	this.fields[4] = {
		"!type": "uint",
		value: this.handleMax || 0xFFFFFFFF
	};
	this.fields[5] = this.offeredCapabilities;
	this.fields[6] = this.desiredCapabilities;
	this.fields[7] = this.properties;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

begin.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.remoteChannel = this.fields[0];
	this.nextOutgoingId = this.fields[1] || 0xFFFFFFFF;
	this.incomingWindow = this.fields[2] || 0xFFFFFFFF;
	this.outgoingWindow = this.fields[3] || 0xFFFFFFFF;
	this.handleMax = this.fields[4] || 0xFFFFFFFF;
	this.offeredCapabilities = this.fields[5];
	this.desiredCapabilities = this.fields[6];
	this.properties = this.fields[7];
};

begin.prototype.toString = function() {
	return amqpcodec.Begin.name + "{remote-channel:{0}, next-outgoing-id:{1}}".format(this.remoteChannel, this.nextOutgoingId);
}

exports.begin = begin;