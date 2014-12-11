var util = require('util'),
	encoder = require("../codec/encoder").encoder,
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

// SasL
var SaslInit = function() {
	describedList.call(this, amqpcodec.SaslInit.code, 3);
};

util.inherits(SaslInit, describedList);

SaslInit.prototype.encode = function(buffer, valueonly) {
	// TODO: symbole of mechanism
	this.fields[0] = this.mechanism;
	this.fields[1] = this.initialResponse;
	this.fields[2] = this.hostname;
	describedList.prototype.encode.call(this, buffer, valueonly);
};
SaslInit.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.mechanism = this.fields[0];
	this.initialResponse = this.fields[1];
	this.hostname = this.fields[2];
};

var SaslChallenge = function() {
	describedList.call(this, amqpcodec.SaslChallenge.code, 1);
};

util.inherits(SaslChallenge, describedList);

SaslChallenge.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.challenge;
	describedList.prototype.encode.call(this, buffer, valueonly);
};
SaslChallenge.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.challenge = this.fields[0];
};

var SaslMechanisms = function() {
	describedList.call(this, amqpcodec.SaslMechanisms.code, 1);
};

util.inherits(SaslMechanisms, describedList);

SaslMechanisms.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.SaslServerMechanisms;
	describedList.prototype.encode.call(this, buffer, valueonly);
};
SaslMechanisms.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.SaslServerMechanisms = this.fields[0];
};

var SaslOutcome = function() {
	describedList.call(this, amqpcodec.SaslOutcome.code, 2);
};

util.inherits(SaslOutcome, describedList);

SaslOutcome.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.code;
	this.fields[1] = this.additionalData;
	describedList.prototype.encode.call(this, buffer, valueonly);
};
SaslOutcome.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.code = this.fields[0];
	this.additionalData = this.fields[1];
};

var SaslResponse = function() {
	describedList.call(this, amqpcodec.SaslResponse.code, 1);
};

util.inherits(SaslResponse, describedList);

SaslResponse.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.response;
	describedList.prototype.encode.call(this, buffer, valueonly);
};
SaslResponse.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.response = this.fields[0];
};

encoder.addDescribed(amqpcodec.SaslInit.code, function() {
	return new SaslInit();
});
encoder.addDescribed(amqpcodec.SaslChallenge.code, function() {
	return new SaslChallenge();
});
encoder.addDescribed(amqpcodec.SaslMechanisms.code, function() {
	return new SaslMechanisms();
});
encoder.addDescribed(amqpcodec.SaslOutcome.code, function() {
	return new SaslOutcome();
});
encoder.addDescribed(amqpcodec.SaslResponse.code, function() {
	return new SaslResponse();
});

exports.SaslInit = SaslInit;
exports.SaslChallenge = SaslChallenge;
exports.SaslMechanisms = SaslMechanisms;
exports.SaslOutcome = SaslOutcome;
exports.SaslResponse = SaslResponse;