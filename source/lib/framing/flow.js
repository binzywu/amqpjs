var util = require('util'),
    describedList = require("../codec/describedlist").describedList,
    Uint = require("../codec/uint").Uint,
    amqpcodec = require("../amqpcodec").amqpcodec;

var flow = function () {
    describedList.call(this, amqpcodec.Flow.code, 11);
};

util.inherits(flow, describedList);

flow.prototype.encode = function (buffer, valueonly) {
    this.fields[0] = new Uint(this.nextIncomingId);
    this.fields[1] = new Uint(this.incomingWindow);
    this.fields[2] = new Uint(this.nextOutgoingId);
    this.fields[3] = new Uint(this.outgoingWindow);
    this.fields[4] = new Uint(this.handle);
    this.fields[5] = new Uint(this.deliveryCount);
    this.fields[6] = new Uint(this.linkCredit);
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
};

flow.prototype.hasHandle = function () {
    return this.fields[4] !== null;
};

flow.prototype.toString = function () {
    return "{0} (next-in-id:{1},in-window:{2},next-out-id:{3},out-window:{4},handle:{5},delivery-count:{6},link-credit:{7})"
        .format(amqpcodec.Flow.name, this.nextIncomingId, this.incomingWindow, this.nextOutgoingId, this.outgoingWindow, this.handle, this.deliveryCount, this.linkCredit);
};

exports.flow = flow;