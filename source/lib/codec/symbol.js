var symbol = function(value) {
	// TODO: validate value.

	this.value = value || "";
	this["!type"] = "symbol";
};

symbol.prototype.isSymbol = function(value) {
	if (value instanceof symbol) {
		return true;
	} else if (value.hasOwnProperty("!type") && value["!type"] == "symbol") {
		return true;
	}

	return false;
};

symbol.prototype.toString = function() {
	return this.value.toString();
};

exports.symbol = symbol;