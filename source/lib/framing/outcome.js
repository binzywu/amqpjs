var util = require('util'),
	Long = require('long'),
	describedList = require("../codec/describedlist").describedList,
	symbol = require("../codec/symbol").symbol,
	amqpcodec = require("../amqpcodec").amqpcodec;

var target = function() {
	describedList.call(this, amqpcodec.Target.code, 7);
};

util.inherits(target, describedList);

target.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.address;
	this.fields[1] = this.durable;
	this.fields[2] = this.expiryPolicy ? new symbol(this.expiryPolicy) : null // symbol?
	this.fields[3] = this.timeout;
	this.fields[4] = this.dynamic;
	this.fields[5] = this.dynamicNodeProperties;
	this.fields[6] = this.capabilities;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

target.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.address = this.fields[0];
	this.durable = this.fields[1] || 0;
	this.expiryPolicy = this.fields[2] && this.fields[2].value ? this.fields[2].value : this.fields[2];
	this.timeout = this.fields[3] === null ? 0 : this.fields[4];
	this.dynamic = this.fields[4] == true;
	this.dynamicNodeProperties = this.fields[5];
	this.capabilities = this.fields[6];
};

target.prototype.toString = function() {
	return "{0}, {address:{1}}".format(amqpcodec.Target.name, this.address);
}

// source
var source = function() {
	describedList.call(this, amqpcodec.Source.code, 11);
};

util.inherits(source, describedList);

source.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.address;
	this.fields[1] = this.durable;
	this.fields[2] = this.expiryPolicy ? new symbol(this.expiryPolicy) : null; // symbol?
	this.fields[3] = this.timeout;
	this.fields[4] = this.dynamic;
	this.fields[5] = this.dynamicNodeProperties;
	this.fields[6] = this.distributionMode ? new symbol(this.distributionMode) : null;
	this.fields[7] = this.filterSet;
	this.fields[8] = this.defaultOutcome;
	this.fields[9] = this.outcomes;
	this.fields[10] = this.capabilities;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

source.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.address = this.fields[0];
	this.durable = this.fields[1] || 0;
	this.expiryPolicy = this.fields[2] && this.fields[2].value ? this.fields[2].value : this.fields[2];
	this.timeout = this.fields[3] === null ? 0 : this.fields[4];
	this.dynamic = this.fields[4] == true;
	this.dynamicNodeProperties = this.fields[5];
	this.distributionMode = this.fields[6] && this.fields[6].value ? this.fields[6].value : this.fields[6];
	this.filterSet = this.fields[7] || {};
	this.defaultOutcome = this.fields[8];
	this.outcomes = this.fields[9];
	this.capabilities = this.fields[10];
};

source.prototype.toString = function() {
	return amqpcodec.Source.name;
}

// received
var received = function() {
	describedList.call(this, amqpcodec.Received.code, 2);
};

util.inherits(received, describedList);

received.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.sectionNumber;
	this.fields[1] = this.sectionOffset;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

received.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.sectionNumber = this.fields[0] || 0;
	this.sectionOffset = this.fields[1] || 0;
};

received.prototype.toString = function() {
	return amqpcodec.Received.name;
}

// accepted
var accepted = function() {
	describedList.call(this, amqpcodec.Accepted.code, 0);
};

util.inherits(accepted, describedList);

accepted.prototype.encode = function(buffer, valueonly) {
	describedList.prototype.encode.call(this, buffer, valueonly);
};

accepted.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
};

accepted.prototype.toString = function() {
	return amqpcodec.Accepted.name;
}

// released
var released = function () {
    describedList.call(this, amqpcodec.Released.code, 0);
};

util.inherits(released, describedList);

released.prototype.encode = function (buffer, valueonly) {
    describedList.prototype.encode.call(this, buffer, valueonly);
};

released.prototype.decode = function (buffer, valueonly) {
    describedList.prototype.decode.call(this, buffer, valueonly);
};

released.prototype.toString = function () {
    return amqpcodec.Released.name;
}

// rejected
var rejected = function() {
	describedList.call(this, amqpcodec.Rejected.code, 1);
};

util.inherits(rejected, describedList);

rejected.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.error;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

rejected.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.sectionNumber = this.fields[0];
};

rejected.prototype.toString = function() {
	return amqpcodec.Rejected.name;
}

// modified
var modified = function() {
	describedList.call(this, amqpcodec.Modified.code, 3);
};

util.inherits(modified, describedList);

modified.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.deliveryFailed;
	this.fields[1] = this.undeliverableHere;
	this.fields[2] = this.messageAnnotations;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

modified.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.deliveryFailed = this.fields[0] == true;
	this.undeliverableHere = this.fields[1] == true;
	this.messageAnnotations = this.fields[2];
};

modified.prototype.toString = function() {
	return amqpcodec.Modified.name;
}

exports.target = target;
exports.source = source;
exports.received = received;
exports.accepted = accepted;
exports.released = released;
exports.rejected = rejected;
exports.modified = modified;