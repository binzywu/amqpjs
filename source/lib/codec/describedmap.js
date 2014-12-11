var util = require('util'),
	formatcode = require("./formatcode").formatcode,
	Encoder = require("./encoder").encoder,
	Described = require("./described").described;

var DescribedMap = function(descriptor, properties) {
	Described.call(this, descriptor);
	this.map = properties || {};
}

util.inherits(DescribedMap, Described);

DescribedMap.prototype.encode = function(buffer, valueonly) {
	if (!valueonly) {
		this.encodeDescriptor(buffer);
	}

	Encoder.getCodec(formatcode.map32).encode(buffer, this.map);
};

DescribedMap.prototype.decode = function(buffer, valueonly) {
	if (!valueonly) {
		this.decodeDescriptor(buffer);
	}

	this.map = Encoder.getCodec(formatcode.map32).decode(buffer);
};

exports.DescribedMap = DescribedMap;