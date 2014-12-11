var util = require('util'),
    describedList = require("../codec/describedlist").describedList,
    amqpcodec = require("../amqpcodec").amqpcodec;

var close = function() {
    describedList.call(this, amqpcodec.Close.code);
};

util.inherits(close, describedList);

close.prototype.encode = function(buffer, valueonly) {
    if (this.error) {
        this.fields[0] = this.error;
    }    describedList.prototype.encode.call(this, buffer, valueonly);
};

close.prototype.decode = function(buffer, valueonly) {
    describedList.prototype.decode.call(this, buffer, valueonly);
    this.error = this.fields[0];
};

close.prototype.toString = function () {
    return "{0} {error:{1}}".format(amqpcodec.Close.name, this.error);
}

exports.close = close;