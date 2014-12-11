var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var error = function() {
	describedList.call(this, amqpcodec.Error.code);
};

util.inherits(error, describedList);

error.prototype.encode = function(buffer, valueonly) {
	this.fields[0] =  this.condition ? new symbol(this.condition) : null;
	this.fields[1] = this.description;
	this.fields[2] = this.info;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

error.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.condition = this.fields[0] && this.fields[0].value ? this.fields[0].value : this.fields[0];
	this.description = this.fields[1];
	this.info = this.fields[2];
};

exports.error = error;