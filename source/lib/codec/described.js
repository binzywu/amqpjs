var formatcode = require("./formatcode").formatcode;

var described = function(descriptor) {
	// name + code = descriptor
	if (descriptor !== null && typeof descriptor == "object" && (descriptor.code === undefined && descriptor.name === undefined)) {
		throw new Error("descriptor invalid.");
	}

	this["!type"] = "described"
	this.descriptor = descriptor;
};

described.isDescribedType = function(val) {
	if (val instanceof described) {
		return true;
	} else if (val.hasOwnProperty("!type") && val["!type"] == "described") {
		return true;
	}

	return false;
};

described.prototype.encodeDescriptor = function(buffer) {
	var encoder = require("./encoder").encoder;
	buffer.writeUint8(formatcode.described);
	if (this.descriptor !== null && Object.prototype.toString.call(this.descriptor) == "[object Object]") {
		encoder.getCodec(formatcode.ulong).encode(buffer, this.descriptor.code);
		// for interoperability, this will be symbol.
		encoder.getCodec(formatcode.symbol32).encode(buffer, this.descriptor.name);
	} else if (Object.prototype.toString.call(this.descriptor) == "[object String]") {
		encoder.getCodec(formatcode.symbol32).encode(buffer, this.descriptor);
	} else if (this.descriptor === null || this.descriptor === undefined) {
		encoder.getCodec(formatcode.null).encode(buffer);
	} else {
		encoder.getCodec(formatcode.ulong).encode(buffer, this.descriptor);
	}
};

described.prototype.decodeDescriptor = function(buffer) {
	var encoder = require("./encoder").encoder;
	encoder.readFormatCode(buffer);
	if (this.descriptor !== null && Object.prototype.toString.call(this.descriptor) == "[object Object]") {
		this.descriptor.code = encoder.getCodec(formatcode.ulong).decode(buffer);
		this.descriptor.name = encoder.getCodec(formatcode.symbol32).decode(buffer);
	} else {
		this.descriptor = encoder.decode(buffer);
	}
};

exports.described = described;