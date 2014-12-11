var util = require('util'),
	formatcode = require("./formatcode").formatcode,
	encoder = require("./encoder").encoder,
	described = require("./described").described;

// should be only code...
var describedList = function(descriptor) {
	described.call(this, descriptor);

	this.fields = [];
}

util.inherits(describedList, described);

describedList.prototype.encode = function(buffer, valueonly) {
	if (!valueonly) {
		this.encodeDescriptor(buffer);
	}

	encoder.getCodec(formatcode.list32).encode(buffer, this.fields);
};

describedList.prototype.decode = function(buffer, valueonly) {
	if (!valueonly) {
		this.decodeDescriptor(buffer);
	}

	this.fields = encoder.getCodec(formatcode.list32).decode(buffer);
};

exports.describedList = describedList;