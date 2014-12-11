var util = require('util'),
    describedList = require("../codec/describedlist").describedList,
    amqpcodec = require("../amqpcodec").amqpcodec;

var end = function() {
    describedList.call(this, amqpcodec.End.code);
};

util.inherits(end, describedList);

end.prototype.encode = function (buffer, valueonly) {
    if (this.error) {
        this.fields[0] = this.error;
    }

    describedList.prototype.encode.call(this, buffer, valueonly);
};

end.prototype.decode = function(buffer, valueonly) {
    describedList.prototype.decode.call(this, buffer, valueonly);
    this.error = this.fields[0];
};

end.prototype.toString = function() {
    return "{0} {error:{1}}".format(amqpcodec.End.name, this.error);
}

exports.end = end;