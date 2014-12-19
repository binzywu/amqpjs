var Uint = function(value) {
	// TODO: validate value.

	this.value = value;
	this["!type"] = "uint";
};

Uint.prototype.isUint = function(value) {
	if (value instanceof Uint) {
		return true;
	} else if (value.hasOwnProperty("!type") && value["!type"] == "uint") {
		return true;
	}

	return false;
};

Uint.prototype.toString = function() {
	return this.value.toString();
};

exports.Uint = Uint;