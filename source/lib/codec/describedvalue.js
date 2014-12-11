var util = require('util'),
	formatcode = require("./formatcode").formatcode,
	encoder = require("./encoder").encoder,
	described = require("./described").described;


var describedValue = function(descriptor, value) {
	described.call(this, descriptor);
	this.value = value;
}

util.inherits(describedValue, described);

describedValue.prototype.encode = function(buffer, valueonly) {
	if (!valueonly) {
		this.encodeDescriptor(buffer);
	}

	encoder.encode(buffer, this.value);
};

describedValue.prototype.decode = function(buffer, valueonly) {
	if (!valueonly) {
		this.decodeDescriptor(buffer);
	}

	this.value = encoder.decode(buffer);
};

exports.describedValue = describedValue;