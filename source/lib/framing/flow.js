var util = require('util'),
    describedList = require("../codec/describedlist").describedList,
    Uint = require("../codec/uint").Uint,
    amqpcodec = require("../amqpcodec").amqpcodec;

var flow = function () {
    describedList.call(this, amqpcodec.Flow.code, 11);
};

util.inherits(flow, describedList);

flow.prototype.encode = function (buffer, valueonly) {
    this.fields[0] = this.nextIncomingId ? new Uint(this.nextIncomingId) : null;
    this.fields[1] = this.incomingWindow ? new Uint(this.incomingWindow) : null;
    this.fields[2] = this.nextOutgoingId ? new Uint(this.nextOutgoingId) : null;
    this.fields[3] = this.outgoingWindow ? new Uint(this.outgoingWindow) : null;
    this.fields[4] = new Uint(this.handle)
    this.fields[5] = this.deliveryCount ? new Uint(this.deliveryCount) : null;
    this.fields[6] = this.linkCredit ? new Uint(this.linkCredit) : null;
    this.fields[7] = this.available;
    this.fields[8] = this.drain;
    this.fields[9] = this.echo;
    this.fields[10] = this.properties;
    describedList.prototype.encode.call(this, buffer, valueonly);
};

flow.prototype.decode = function (buffer, valueonly) {
    describedList.prototype.decode.call(this, buffer, valueonly);
    this.nextIncomingId = this.fields[0] === null ? 0 : this.fields[0];
    this.incomingWindow = this.fields[1] === null ? 0xFFFFFFFF : this.fields[1];
    this.nextOutgoingId = this.fields[2] === null ? 0 : this.fields[2];
    this.outgoingWindow = this.fields[3] === null ? 0xFFFFFFFF : this.fields[3];
    this.handle = this.fields[4] === null ? 0xFFFFFFFF : this.fields[4];
    this.deliveryCount = this.fields[5] === null ? 0 : this.fields[5];
    this.linkCredit = this.fields[6] === null ? 0 : this.fields[6];
    this.available = this.fields[7] === null ? 0 : this.fields[7];
    this.drain = this.fields[8] == true;
    this.echo = this.fields[9] == true;
    this.properties = this.fields[10];
    
    this.hasHandle = this.fields[4] !== null;
};

exports.flow = flow;