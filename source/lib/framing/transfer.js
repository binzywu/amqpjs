var util = require('util'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var transfer = function() {
	describedList.call(this, amqpcodec.Transfer.code, 11);
};

util.inherits(transfer, describedList);

transfer.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.handle;
	this.fields[1] = this.deliveryId;
	this.fields[2] = this.deliveryTag;
	this.fields[3] = this.messageFormat;
	this.fields[4] = this.settled;
	this.fields[5] = this.more;
	this.fields[6] = this.rcvSettleMode;
	this.fields[7] = this.state;
	this.fields[8] = this.resume;
	this.fields[9] = this.aborted;
	this.fields[10] = this.batchable;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

transfer.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.handle = this.fields[0] == null ? 0xFFFFFFFF : this.fields[0];
	this.deliveryId = this.fields[1] || null ? 0 : this.fields[1];
	this.deliveryTag = this.fields[2];
	this.messageFormat = this.fields[3] || null ? 0 : this.fields[3];
	this.settled = this.fields[4] == true;
	this.more = this.fields[5] == true;
	this.rcvSettleMode = this.fields[6] == null ? 0 : this.fields[6];
	this.state = this.fields[7];
	this.resume = this.fields[8] == true;
	this.aborted = this.fields[9] == true;
	this.batchable = this.fields[10] == true;

	this.hasDeliveryId = this.fields[1] != null;
};

exports.transfer = transfer;