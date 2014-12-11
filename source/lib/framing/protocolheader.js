//

var protocolheader = function(buffer) {
	buffer = buffer.buffer || buffer;

	if (buffer[0] !== 0x41 || buffer[1] !== 0x4d || buffer[2] !== 0x51 || buffer[3] !== 0x50) {
		throw new Error("Illegal protocol header.");
	}

	this.id = buffer[4];
	this.major = buffer[5];
	this.minor = buffer[6];
	this.revision = buffer[7];
};

protocolheader.prototype.toString = function(){
	return "id: " + this.id + ", ver: " + this.major + "." + this.minor + "." + this.revision;
};

exports.protocolheader = protocolheader;