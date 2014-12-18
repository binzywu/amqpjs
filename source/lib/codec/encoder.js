var fixedwidth = require("./fixedwidth").fixedwidth,
	formatcode = require("./formatcode").formatcode,
	described = require("./described").described,
	describedValue = require("./describedvalue").describedValue,
	symbol = require("./symbol").symbol,
	Long = require("long"),
	uuid = require("uuid"),
	bytebuffer = require("bytebuffer");

var readFormatCode = function(buffer) {
	var code = buffer.readUint8();
	return code;
};

var encoder = function() {
	var self = this;
	this.codecByCode = {};
	this.knownDescribed = {};

	// built in types.

	// Boolean
	this.codecByCode[formatcode.boolean] =
		this.codecByCode[formatcode.true] =
		this.codecByCode[formatcode.false] = function(codecCode) {
			return {
				encode: function(buffer, data) {
					if (codecCode == formatcode.true) {
						buffer.writeUint8(formatcode.true);
					} else if (codecCode == formatcode.false) {
						buffer.writeUint8(formatcode.false);
					} else {
						buffer.writeUint8(data ? formatcode.true : formatcode.false);
					}

				},
				decode: function(buffer, code) {
					code = code || readFormatCode(buffer);
					if (code == formatcode.null) {
						return null;
					}

					if (code == formatcode.true) {
						return true;
					}

					if (code == formatcode.false) {
						return false;
					}

					var data = buffer.readByte();
					return data != 0;
				}
			}
		};

	// Null
	this.codecByCode[formatcode.null] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.null);
		},
		decode: function(buffer, code) {
			return null;
		}
	};

	// UByte
	this.codecByCode[formatcode.ubyte] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.ubyte)
				.writeUint8(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readUint8();
		}
	};

	// Byte
	this.codecByCode[formatcode.byte] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.byte)
				.writeByte(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readByte();
		}
	};

	// UInt0, UInt, SmallUInt
	this.codecByCode[formatcode.uint0] =
		this.codecByCode[formatcode.uint] =
		this.codecByCode[formatcode.smalluint] = function(codecCode) {
			return {
				encode: function(buffer, data) {
					if (codecCode == formatcode.uint0) {
						buffer.writeUint8(formatcode.uint0);
					} else if (data <= 255) {
						buffer.writeUint8(formatcode.smalluint)
							.writeUint8(data);
					} else {
						buffer.writeUint8(formatcode.uint)
							.writeUint32(data);
					}
				},
				decode: function(buffer, code) {
					code = code || readFormatCode(buffer);
					if (code == formatcode.null) {
						return null;
					}

					if (code == formatcode.uint0) {
						return 0;
					} else if (code == formatcode.smalluint) {
						return buffer.readUint8();
					} else {
						return buffer.readUint32();
					}
				}
			}
		};

	// UShort
	this.codecByCode[formatcode.ushort] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.ushort)
				.writeUint16(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readUint16();
		}
	};

	// ULong0, SmallULong, ULong
	this.codecByCode[formatcode.ulong0] =
		this.codecByCode[formatcode.smallulong] =
		this.codecByCode[formatcode.ulong] = function(codecCode) {
			return {
				encode: function(buffer, data) {
					if (codecCode == formatcode.ulong0) {
						buffer.writeUint8(formatcode.ulong0);
					} else if ((Long.isLong(data) && data.lessThan(255)) || data <= 255) {
						buffer.writeUint8(formatcode.smallulong)
							.writeUint8(Long.isLong(data) ? data.toNumber() : data);
					} else {
						// TODO, have a issue here. javascript instanceof is a dangerous operation.
						if (typeof data == "number") {
							data = Long.fromNumber(data, true);
						}

						buffer.writeUint8(formatcode.ulong)
							.writeUint64(data);
					}
				},
				decode: function(buffer, code) {
					code = code || readFormatCode(buffer);
					if (code == formatcode.null) {
						return null;
					}

					if (code == formatcode.ulong0) {
						return 0;
					} else if (code == formatcode.smallulong) {
						return buffer.readUint8();
					} else {
						return buffer.readUint64().toNumber();
					}
				}
			}
		};

	// Short
	this.codecByCode[formatcode.short] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.short)
				.writeInt16(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readInt16();
		}
	};

	// Int, SmallInt
	this.codecByCode[formatcode.int] =
		this.codecByCode[formatcode.smallint] = {
			encode: function(buffer, data) {
				if (data <= 127 && data >= -128) {
					buffer.writeUint8(formatcode.smallint)
						.writeByte(data);

				} else {
					buffer.writeUint8(formatcode.int)
						.writeInt32(data);
				}
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				if (code == formatcode.smallint) {
					return buffer.readByte();
				} else {
					return buffer.readInt32();
				}
			}
		};

	// Long, SmallLong
	this.codecByCode[formatcode.long] =
		this.codecByCode[formatcode.smalllong] = {
			encode: function(buffer, data) {
				if (data <= 127 && data >= -128) {
					buffer.writeUint8(formatcode.smalllong)
						.writeByte(data);

				} else {
					buffer.writeUint8(formatcode.long)
						.writeInt64(data);
				}
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				if (code == formatcode.smalllong) {
					return buffer.readByte();
				} else {
					return buffer.readInt64().toNumber();
				}
			}
		};

	// Float
	this.codecByCode[formatcode.float] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.float)
				.writeFloat(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readFloat();
		}
	};

	// Double
	this.codecByCode[formatcode.double] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.double)
				.writeDouble(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return buffer.readDouble();
		}
	};

	// Char
	this.codecByCode[formatcode.char] = {
		encode: function(buffer, data) {
			buffer.writeUint8(formatcode.char)
				.writeInt(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			// UTF32?
			return buffer.readInt();
		}
	};

	// TimeStamp
	this.codecByCode[formatcode.timestamp] = {
		encode: function(buffer, data) {
			if (data instanceof Date) {
				data = data.getTime();
			} else {
				throw new TypeError("Illegal type of data: " + data);
			}

			buffer.writeUint8(formatcode.timestamp)
				.writeUint64(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			return new Date(buffer.readUint64().toNumber());
		}
	};

	// Uuid
	this.codecByCode[formatcode.uuid] = {
		encode: function(buffer, data) {
			// TODO: validate.
			/*
			if (!(data instanceof uuid)) {
				throw TypeError("Illegal value " + data + " is not uuid.");
			}*/

			// TODO: might need to support different platforms.
			buffer.writeUint8(formatcode.uuid);
			if (!Array.isArray(data)) {
				data = uuid.parse(data);
			}

			buffer.append(data);
		},
		decode: function(buffer, code) {
			code = code || readFormatCode(buffer);
			if (code == formatcode.null) {
				return null;
			}

			var bytes = [];
			bytes.length = 16;
			for (var i = 0; i < 16; i++) {
				bytes[i] = buffer.readUint8();
			}
			return uuid.unparse(bytes);
		}
	};

	// Binary8, Binary32
	// TOOD: need to verify perf.
	this.codecByCode[formatcode.binary8] =
		this.codecByCode[formatcode.binary32] = {
			encode: function(buffer, data) {
				// data is bytebuffer, arraybuffer or anything...
				data = data.buffer || data;
				var length = data.length || data.byteLength;
				if (length <= 0xFF) {
					buffer.writeUint8(formatcode.binary8)
						.writeUint8(length);
				} else {
					buffer.writeUint8(formatcode.binary32)
						.writeUint32(length);
				}

				buffer.append(data);
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				var length = code == formatcode.binary8 ? buffer.readUint8() : buffer.readUint32();
				var bytes = [];
				bytes.length = length;
				for (var i = 0; i < length; i++) {
					bytes[i] = buffer.readUint8();
				};
				return bytebuffer.wrap(bytes);
			}
		};

	// String8Utf8, String32Utf8
	this.codecByCode[formatcode.string8] =
		this.codecByCode[formatcode.string32] = {
			encode: function(buffer, data) {
				if (Object.prototype.toString.call(data) != "[object String]") {
					throw TypeError("Illegal data: " + data + " is not string.");
				} else if (typeof data == "object") {
					data = data.toString();
				}

				var length = data.length;
				buffer.ensureCapacity(buffer.offset + length + 2);

				if (length <= 0xFF) {
					buffer.writeUint8(formatcode.string8)
						.writeUint8(length);
				} else {
					buffer.writeUint8(formatcode.string32)
						.writeUint32(length);
				}

				buffer.writeString(data);
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				var length = code == formatcode.string8 ? buffer.readUint8() : buffer.readUint32();
				buffer.limit = buffer.offset + length;
				return buffer.readString(length);
			}
		};

	// Symbol8, Symbol32, Symbol is a ASCII string
	// TODO: revisit this.
	this.codecByCode[formatcode.symbol8] =
		this.codecByCode[formatcode.symbol32] = {
			encode: function(buffer, data) {
				var length = data && data.value ? data.value.length : data.length;
				buffer.ensureCapacity(buffer.offset + length + 2);
				if (length <= 0xFF) {
					buffer.writeUint8(formatcode.symbol8)
						.writeUint8(length);
				} else {
					buffer.writeUint8(formatcode.symbol32)
						.writeUint32(length);
				}

				buffer.writeString(data);
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				var length = code == formatcode.symbol8 ? buffer.readUint8() : buffer.readUint32();
				buffer.limit = buffer.offset + length;
				return new symbol(buffer.readString(length));
			}
		};

	// List0/8/32 <- compound needs something... how can i check type and encode?
	this.codecByCode[formatcode.list0] =
		this.codecByCode[formatcode.list8] =
		this.codecByCode[formatcode.list32] = function(codecCode) {
			return {
				encode: function(buffer, data) {
					if (codecCode == formatcode.list0 || data.length == 0) {
						buffer.writeUint8(formatcode.list0);
					} else {
						// always creating new buffer for list and map to handle nested.
						var tmpBuffer = new bytebuffer();
						for (var i = 0; i < data.length; i++) {
							self.encode(tmpBuffer, data[i]);
						}

						var size = tmpBuffer.offset;
						if (size < 0xFF && data.length <= 0xFF) {
							buffer.writeUint8(formatcode.list8)
								.writeUint8(size + 1)
								.writeUint8(data.length);
						} else {
							buffer.writeUint8(formatcode.list32)
								.writeInt32(size + 4)
								.writeInt32(data.length);
						}

						// append temp buffer to
						buffer.ensureCapacity(buffer.offset + size);
						tmpBuffer.copyTo(buffer, buffer.offset, 0, size);
						buffer.offset = buffer.offset + size;
					}
				},
				decode: function(buffer, code) {
					code = code || readFormatCode(buffer);
					if (code == formatcode.null) {
						return null;
					}

					var size;
					var count;
					if (code == formatcode.list0) {
						size = count = 0;
					} else if (code == formatcode.list8) {
						size = buffer.readUint8();
						count = buffer.readUint8();
					} else {
						size = buffer.readInt32();
						count = buffer.readInt32();
					}

					var result = [];
					result.length = count;
					for (var i = 0; i < count; i++) {
						result[i] = self.decode(buffer);
					}

					return result;
				}
			};
		};

	// map
	this.codecByCode[formatcode.map8] =
		this.codecByCode[formatcode.map32] = {
			encode: function(buffer, data) {

				var tmpBuffer = new bytebuffer();
				var count = 0;
				for (var property in data) {
					self.encode(tmpBuffer, property);
					self.encode(tmpBuffer, data[property]);
					count = count + 2;
				}

				var size = tmpBuffer.offset;
				if (size < 0xFF && count <= 0xFF) {
					buffer.writeUint8(formatcode.map8)
						.writeUint8(size + 1)
						.writeUint8(count);
				} else {
					buffer.writeUint8(formatcode.map32)
						.writeInt32(size + 4)
						.writeInt32(count);
				}

				// append temp buffer to
				buffer.ensureCapacity(buffer.offset + size);
				tmpBuffer.copyTo(buffer, buffer.offset, 0, size);
				buffer.offset = buffer.offset + size;
			},
			decode: function(buffer, code) {
				code = code || readFormatCode(buffer);
				if (code == formatcode.null) {
					return null;
				}

				var size;
				var count;
				if (code == formatcode.map8) {
					size = buffer.readUint8();
					count = buffer.readUint8();
				} else {
					size = buffer.readInt32();
					count = buffer.readInt32();
				}

				if (count % 2 > 0) {
					throw new Error("decode map error.");
				}

				var result = {};
				for (var i = 0; i < count / 2; i++) {
					var key = self.decode(buffer);
					result[key] = self.decode(buffer);
				}

				return result;
			}
		};

	// array
	this.codecByCode[formatcode.array8] =
		this.codecByCode[formatcode.array32] = function(codecCode) {
			return {
				encode: function(buffer, data) {
					buffer.writeUint8(codecCode);
				},
				decode: function(buffer, code) {
					code = code || readFormatCode(buffer);
				}
			};
		};

	// described
};

encoder.prototype.readFormatCode = readFormatCode;

// check whether we need this:...
encoder.prototype.getCodec = function(code) {
	if (this.codecByCode[code]) {
		var codec = this.codecByCode[code];
		if (typeof codec == "function") {
			codec = codec(code);
		}

		return codec;
	}
};

encoder.prototype.addDescribed = function(code, name, type) {
	if (arguments.length == 2) {
		type = name;
	}
	if (typeof type != "function") {
		throw new Error("type needs to be a function." + (typeof type));
	}

	this.knownDescribed[code] = type;
	if (arguments.length == 3) {
		this.knownDescribed[name] = type;
	}
};

encoder.prototype.encode = function(buffer, value) {
	var type = typeof value;
	var val = value;
	var type2 = Object.prototype.toString.call(value);
	type2 = type2.substring(8, type2.length - 1).toLowerCase();

	// swape value if !type defined.
	if (value && type === "object" && value.hasOwnProperty("!type") && value.hasOwnProperty("value")) {
		val = value["value"];
		type = value["!type"];
	}

	// get code.
	var code;
	if (formatcode.hasOwnProperty(type)) {
		code = formatcode[type];
	} else {
		switch (type) {
			// what?
			case "boolean":
				code = formatcode.boolean;
				break;
			case "undefined":
				code = formatcode.null;
				break;
			case "symbol":
				code = formatcode.symbol32;
				break;
			case "object":
				// amen!
				if (val === null) {
					// null
					code = formatcode.null;
				} else {
					if (Buffer.isBuffer(val) || bytebuffer.isByteBuffer(val)) {
						// binary
						code = formatcode.binary32;
					} else if (Long.isLong(val)) {
						if (Long.MAX_VALUE.lessThanOrEqual(val)) {
							code = formatcode.ulong;
						} else {
							code = formatcode.long;
						}
					} else if (Array.isArray(val)) {
						// test whether same type?
						if (val.length == 0) {
							code = formatcode.array32;
						} else {
							var firsttype = typeof val[0];
							if (firsttype == "object" || firsttype == "undefined") {
								// consider as list
								code = formatcode.list32;
							} else {
								var isList = false;
								for (var i = val.length - 1; i > 0; i--) {
									if (typeof val[i] != firsttype) {
										isList = true;
										break;
									}
								}

								// list for all.
								code = isList ? formatcode.list32 : formatcode.array32;
							}
						}
					} else if (described.isDescribedType(val)) {
						code = formatcode.described;
					} else {
						switch (type2) {
							case "uuid":
								code = formatcode.uuid;
								break;
							case "uint8array":
								code = formatcode.binary32;
								break;
							case "date":
								code = formatcode.timestamp;
								break;
							case "string":
								code = formatcode.string32;
								break;
							case "number":
								code = getCodeForNumber(val);
								break;
							default:
								// default consider object as map.
								code = formatcode.map32;
								break;
						}
					}
				}
				break;
			case "string":
				code = formatcode.string32;
				break;
			case "number":
				code = getCodeForNumber(val);
				break;
			default:
				throw new Error("Not supported type: " + type);
				break;
		}
	}

	if (code == formatcode.ulong && !Long.isLong(val)) {
		val = Long.fromNumber(val, true);
	}

	if (code === undefined) {
		throw new Error("Cannot find format code. type: " + type + ", type2: " + type2);
	} else if (code == formatcode.described) {
		value.encode(buffer);
	} else {
		var codec = this.getCodec(code);
		if (codec === undefined) {
			throw new Error("Cannot find codec for code: 0x" + code.toString(16));
		}

		codec.encode(buffer, val);
	}

	function getCodeForNumber(val) {
		var code;
		if (val % 1 !== 0) {
			// double for now.
			code = formatcode.double;
		} else if (val < 1 << 8 && val >= 1 << 7) {
			code = formatcode.ubyte;
		} else if (val < 1 << 7 && val >= -1 << 7) {
			code = formatcode.byte;
		} else if (val < 1 << 15 && val >= -1 << 15) {
			code = formatcode.short;
		} else if (val < 1 << 31 >>> 0 && val >= -1 << 31) {
			code = formatcode.int;
		} else {
			// long
			if (Long.MAX_VALUE.lessThanOrEqual(val) || Long.MAX_VALUE.toNumber() <= val) {
				code = formatcode.ulong;
			} else {
				code = formatcode.long;
			}
		}
		return code;
	}
};

encoder.prototype.decode = function(buffer, code) {
	var code = code || readFormatCode(buffer);
	// get codec and then decode
	var codec = this.getCodec(code);
	if (codec) {
		return codec.decode(buffer, code);
	} else if (code == formatcode.described) {
		// read descriptor
		var descriptor = this.decode(buffer);
		var described;
		var ctor = this.knownDescribed[descriptor];
		if (typeof ctor == "function") {
			described = ctor(descriptor);
			described.decode(buffer, true);
		} else {
			// described value
			described = new describedValue(descriptor, this.decode(buffer));
		}

		return described;
	} else {
		// TODO: enrich.
		throw new Error("decode error with code: 0x" + code.toString(16));
	}
};

exports.encoder = new encoder();