var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var flow = function() {
	describedList.call(this, amqpcodec.Flow.code, 11);
};

util.inherits(flow, describedList);

flow.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.nextIncomingId;
	this.fields[1] = this.incomingWindow;
	this.fields[2] = this.nextOutgoingId;
	this.fields[3] = this.outgoingWindow;
	this.fields[4] = this.handle;
	this.fields[5] = this.deliveryCount;
	this.fields[6] = this.linkCredit;
	this.fields[7] = this.available;
	this.fields[8] = this.drain;
	this.fields[9] = this.echo;
	this.fields[10] = this.properties;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

flow.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.nextIncomingId = this.fields[0] == null ? 0 : this.fields[0];
	this.incomingWindow = this.fields[1] || 0xFFFFFFFF;
	this.nextOutgoingId = this.fields[2] == null ? 0 : this.fields[2];
	this.outgoingWindow = this.fields[3] || 0xFFFFFFFF;
	this.handle = this.fields[4] || 0xFFFFFFFF;
	this.deliveryCount = this.fields[5] == null ? 0 : this.fields[5];
	this.linkCredit = this.fields[6] == null ? 0 : this.fields[6];
	this.available = this.fields[7] == null ? 0 : this.fields[7];
	this.drain = this.fields[8] == true;
	this.echo = this.fields[9] == true;
	this.properties = this.fields[10];

	this.hasHandle = this.fields[4] !== null;
};

exports.flow = flow;