var util = require('util'),
	Long = require('long'),
	described = require("../codec/described").described,
	describedList = require("../codec/describedlist").describedList,
	describedValue = require("../codec/describedvalue").describedValue,
	DescribedMap = require("../codec/describedmap").DescribedMap,
	formatcode = require("../codec/formatcode").formatcode,
	amqpcodec = require("../amqpcodec").amqpcodec;

// message related codes
var Header = function() {
	describedList.call(this, amqpcodec.Header.code, 5);
};

util.inherits(Header, describedList);

Header.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.durable || false;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

Header.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.error = this.fields[0] || false;
};

// DeliveryAnnotations
var DeliveryAnnotations = function(annotations) {
	DescribedMap.call(this, amqpcodec.DeliveryAnnotations.code, annotations);
};

util.inherits(DeliveryAnnotations, DescribedMap);

// MessageAnnotations
var MessageAnnotations = function(annotations) {
	DescribedMap.call(this, amqpcodec.MessageAnnotations.code, annotations);
};

util.inherits(MessageAnnotations, DescribedMap);

// Properties
var Properties = function() {
	describedList.call(this, amqpcodec.Properties.code, 13);
};

util.inherits(Properties, describedList);

Properties.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.messageId; // string
	this.fields[1] = this.userId; // buffer
	this.fields[2] = this.to; // string
	this.fields[3] = this.subject;
	this.fields[4] = this.replyTo;
	this.fields[5] = this.correlationId;
	this.fields[6] = this.contentType;
	this.fields[7] = this.contentEncoding;
	this.fields[8] = this.absoluteExpiryTime;
	this.fields[9] = this.creationTime;
	this.fields[10] = this.groupId;
	this.fields[11] = this.groupSequence;
	this.fields[12] = this.replyToGroupId;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

Properties.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.messageId = this.fields[0];
	this.userId = this.fields[1];
	this.to = this.fields[2];
	this.subject = this.fields[3];
	this.replyTo = this.fields[4];
	this.correlationId = this.fields[5];
	this.contentType = this.fields[6];
	this.contentEncoding = this.fields[7];
	this.absoluteExpiryTime = this.fields[8] == true;
	this.creationTime = this.fields[9] || 0xFFFFFFFF;
	this.groupId = this.fields[10] || Long.MAX_UNSIGNED_VALUE;
	this.groupSequence = this.fields[11];
	this.replyToGroupId = this.fields[12];
};

Properties.prototype.toString = function() {
	return "{0} {message-id:{1}}".format(amqpcodec.Properties.name, this.messageId);
}

// applicationproperties
var ApplicationProperties = function(properties) {
	DescribedMap.call(this, amqpcodec.ApplicationProperties.code, properties);
};

util.inherits(ApplicationProperties, DescribedMap);

// data
var Data = function() {
	described.call(this, amqpcodec.Data.code);
	this.binary = [];
};

util.inherits(Data, described);

Data.prototype.encode = function(buffer, valueonly) {
	if (!valueonly) {
		this.encodeDescriptor(buffer);
	}

	encoder.getCodec(formatcode.binary32).encode(buffer, this.binary);
};

Data.prototype.decode = function(buffer, valueonly) {
	if (!valueonly) {
		this.decodeDescriptor(buffer);
	}

	this.binary = encoder.getCodec(formatcode.binary32).decode(buffer);
};

// amqpsequence
var AmqpSequence = function() {
	described.call(this, amqpcodec.AmqpSequence.code);
	this.list = [];
};

util.inherits(AmqpSequence, described);

AmqpSequence.prototype.encode = function(buffer, valueonly) {
	if (!valueonly) {
		this.encodeDescriptor(buffer);
	}

	encoder.getCodec(formatcode.array32).encode(buffer, this.list);
};

AmqpSequence.prototype.decode = function(buffer, valueonly) {
	if (!valueonly) {
		this.decodeDescriptor(buffer);
	}

	this.list = encoder.getCodec(formatcode.array32).decode(buffer);
};

// amqpvalue
var AmqpValue = function() {
	describedValue.call(this, amqpcodec.AmqpValue.code);
};

util.inherits(AmqpValue, describedValue);

exports.Header = Header;
exports.DeliveryAnnotations = DeliveryAnnotations;
exports.MessageAnnotations = MessageAnnotations;
exports.Properties = Properties;
exports.Data = Data;
exports.AmqpSequence = AmqpSequence;
exports.AmqpValue = AmqpValue;