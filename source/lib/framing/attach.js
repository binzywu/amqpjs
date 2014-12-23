var util = require('util'),
	Long = require('long'),
	describedList = require("../codec/describedlist").describedList,
	amqpcodec = require("../amqpcodec").amqpcodec;

var attach = function() {
	describedList.call(this, amqpcodec.Attach.code);
};

util.inherits(attach, describedList);

attach.prototype.encode = function(buffer, valueonly) {
	this.fields[0] = this.linkname;
	this.fields[1] = {
		"!type": "uint",
		value: this.handle
	};
	this.fields[2] = this.role;
	this.fields[3] = this.sndSettleMode ? {
		"!type": "byte",
		value: this.sndSettleMode
	} : null;
	this.fields[4] = this.rcvSettleMode ? {
		"!type": "byte",
		value: this.rcvSettleMode || 0
	} : null;
	this.fields[5] = this.source;
	this.fields[6] = this.target;
	this.fields[7] = this.unsettled;
	this.fields[8] = this.incompleteUnsettled;
	this.fields[9] = {
		"!type": "uint",
		value: this.initialDeliveryCount || 0
	};
	this.fields[10] = {
		"!type": "ulong",
		value: this.maxMessageSize || 0
	};
	this.fields[11] = this.offeredCapabilities;
	this.fields[12] = this.desiredCapabilities;
	this.fields[13] = this.properties;
	describedList.prototype.encode.call(this, buffer, valueonly);
};

attach.prototype.decode = function(buffer, valueonly) {
	describedList.prototype.decode.call(this, buffer, valueonly);
	this.linkname = this.fields[0];
	this.handle = this.fields[1];
	this.role = this.fields[2] == true;
	this.sndSettleMode = this.fields[3] === null ? 0 : this.fields[3];
	this.rcvSettleMode = this.fields[4] === null ? 0 : this.fields[4];
	this.source = this.fields[5];
	this.target = this.fields[6];
	this.unsettled = this.fields[7];
	this.incompleteUnsettled = this.fields[8] == true;
	this.initialDeliveryCount = this.fields[9] || 0;
	this.maxMessageSize = this.fields[10] || Long.MAX_UNSIGNED_VALUE;
	this.offeredCapabilities = this.fields[11];
	this.desiredCapabilities = this.fields[12];
	this.properties = this.fields[13];
};

attach.prototype.toString = function() {
    return "{0} {linkname:{1},handle:{2},role:{3},snd-settle-mode:{4},rcv-settle-mode:{5},source:{6},target:{7}}"
        .format(amqpcodec.Attach.name, this.linkname, this.handle, this.role, this.sndSettleMode, this.rcvSettleMode, this.source, this.target);
}

exports.attach = attach;