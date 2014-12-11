var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var detach = function() {
	describedList.call(this, amqpcodec.Detach.code, 3);
};

util.inherits(detach, describedList);

detach.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = {
		"!type": "uint",
		value: this.handle
	};
	this.fields[1] = this.closed;
	this.fields[2] = this.error;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

detach.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.handle = this.fields[0];
	this.closed = this.fields[1] == true;
	this.error = this.fields[2];
};

detach.prototype.toString = function() {
	return "{0} {handle:{1}, closed: {2}}".format(amqpcodec.Detach.name, this.handle, this.closed);
};

exports.detach = detach;