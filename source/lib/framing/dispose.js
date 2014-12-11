var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var dispose = function() {
	describedList.call(this, amqpcodec.Dispose.code, 6);
};

util.inherits(dispose, describedList);

dispose.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.role;
	this.fields[1] = this.first;
	this.fields[2] = this.last;
	this.fields[3] = this.settled;
	this.fields[4] = this.state;
	this.fields[5] = this.batchable;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

dispose.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.role = this.fields[0] == true;
	this.first = this.fields[1] == null ? 0 : this.fileds[1];
	this.last = this.fields[2] == null ? this.first : this.fileds[2];
	this.settled = this.fields[3] == true;
	this.state = this.fields[4];
	this.batchable = this.fields[5] == true;
};

exports.dispose = dispose;