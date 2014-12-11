var amqp = require("../lib/index");
var bytebuffer = require("bytebuffer");
var Long = require("long");
var uuid = require("uuid");

module.exports = {

	testDefinitions: function(test) {
		test.equal(typeof amqp.connection, "function");
		test.equal(typeof amqp.formatcode, "object");

		// encoder
		test.equal(typeof amqp.encoder.getCodec, "function");
		test.equal(typeof amqp.describedList, "function");
		test.equal(amqp.fixedwidth.NullEncoded, 1);
		test.done();
	},

	testCodec: function(test) {

		// boolean
		var buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.boolean).encode(buffer, false);
		amqp.encoder.getCodec(amqp.formatcode.boolean).encode(buffer, true);
		amqp.encoder.getCodec(amqp.formatcode.true).encode(buffer);
		amqp.encoder.getCodec(amqp.formatcode.false).encode(buffer);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.boolean).decode(buffer), false);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.boolean).decode(buffer), true);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.true).decode(buffer), true);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.false).decode(buffer), false);

		// null
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.null).encode(buffer);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.null).decode(buffer), null);

		// ubyte
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.ubyte).encode(buffer, 0xFF);
		amqp.encoder.getCodec(amqp.formatcode.ubyte).encode(buffer, 0x0);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ubyte).decode(buffer), 0xFF);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ubyte).decode(buffer), 0x0);

		// byte
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.byte).encode(buffer, 0x7F);
		amqp.encoder.getCodec(amqp.formatcode.byte).encode(buffer, -128);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.byte).decode(buffer), 0x7F);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.byte).decode(buffer), -1 << 7);

		// uint0, uint, smallint
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.uint0).encode(buffer, 0);
		amqp.encoder.getCodec(amqp.formatcode.uint0).encode(buffer);
		amqp.encoder.getCodec(amqp.formatcode.smalluint).encode(buffer, 255);
		amqp.encoder.getCodec(amqp.formatcode.uint).encode(buffer, 256);
		amqp.encoder.getCodec(amqp.formatcode.uint).encode(buffer, 4294967295);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.uint0).decode(buffer), 0);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.uint0).decode(buffer), 0);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.smalluint).decode(buffer), 255);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.uint).decode(buffer), 256);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.uint).decode(buffer), 4294967295);

		// ushort
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.ushort).encode(buffer, 0);
		amqp.encoder.getCodec(amqp.formatcode.ushort).encode(buffer, (1 << 16) - 1);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ushort).decode(buffer), 0);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ushort).decode(buffer), (1 << 16) - 1);

		// short
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.short).encode(buffer, -1 << 15);
		amqp.encoder.getCodec(amqp.formatcode.short).encode(buffer, (1 << 15) - 1);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.short).decode(buffer), -32768);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.short).decode(buffer), 32767);

		// ulong0, usmalllong, ulong
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.ulong0).encode(buffer, 0);
		amqp.encoder.getCodec(amqp.formatcode.ulong0).encode(buffer);
		amqp.encoder.getCodec(amqp.formatcode.smallulong).encode(buffer, 255);
		amqp.encoder.getCodec(amqp.formatcode.ulong).encode(buffer, 256);
		amqp.encoder.getCodec(amqp.formatcode.ulong).encode(buffer, Long.fromInt(-1, true));
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ulong0).decode(buffer), 0);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ulong0).decode(buffer), 0);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.smallulong).decode(buffer), 255);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ulong).decode(buffer), 256);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.ulong).decode(buffer), Long.MAX_UNSIGNED_VALUE);
		//console.log(Long.MAX_VALUE.toString());

		// int, smallint
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.int).encode(buffer, -1 << 31);
		amqp.encoder.getCodec(amqp.formatcode.int).encode(buffer, ((1 << 31) >>> 0) - 1);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.int).decode(buffer), -1 << 31);
		test.equal(amqp.encoder.getCodec(amqp.formatcode.int).decode(buffer), ((1 << 31) >>> 0) - 1);

		// long, smalllong

		// float

		// double

		// char
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.char).encode(buffer, "你".charCodeAt(0));
		buffer.reset();
		test.equal(String.fromCharCode(amqp.encoder.getCodec(amqp.formatcode.char).decode(buffer)), "你");

		// timestamp
		buffer = new bytebuffer();
		var time = new Date();
		amqp.encoder.getCodec(amqp.formatcode.timestamp).encode(buffer, time);
		buffer.reset();
		test.equal(new Date(amqp.encoder.getCodec(amqp.formatcode.timestamp).decode(buffer)).getTime(), time.getTime());

		// uuid
		buffer = new bytebuffer();
		var testUuid = uuid.v4();
		amqp.encoder.getCodec(amqp.formatcode.uuid).encode(buffer, testUuid);
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.uuid).decode(buffer), testUuid);

		// binary
		buffer = new bytebuffer();
		var ab = new Uint8Array(6);
		ab[0] = 1;
		ab[1] = 2;
		ab[2] = 3;
		ab[3] = 4;
		ab[4] = 5;
		ab[5] = 6;
		var ab2 = bytebuffer.fromUTF8("amqp");
		amqp.encoder.getCodec(amqp.formatcode.binary8).encode(buffer, ab);
		amqp.encoder.getCodec(amqp.formatcode.binary8).encode(buffer, ab2);
		buffer.reset();
		test.ok(arraysEqual(amqp.encoder.getCodec(amqp.formatcode.binary8).decode(buffer), bytebuffer.wrap(ab)));
		var ab22 = amqp.encoder.getCodec(amqp.formatcode.binary8).decode(buffer);
		test.ok(arraysEqual(ab22, ab2));

		// string
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.string8).encode(buffer, "abc");
		amqp.encoder.getCodec(amqp.formatcode.string32).encode(buffer, "abc");
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.string8).decode(buffer), "abc");
		test.equal(amqp.encoder.getCodec(amqp.formatcode.string32).decode(buffer), "abc");

		// symbol
		buffer = new bytebuffer();
		amqp.encoder.getCodec(amqp.formatcode.symbol8).encode(buffer, "abc");
		amqp.encoder.getCodec(amqp.formatcode.symbol32).encode(buffer, "abc");
		buffer.reset();
		test.equal(amqp.encoder.getCodec(amqp.formatcode.symbol8).decode(buffer).value, "abc");
		test.equal(amqp.encoder.getCodec(amqp.formatcode.symbol32).decode(buffer).value, "abc");

		test.done();
	}
};

function arraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length)
		return false;
	for (var i = arr1.length; i--;) {
		if (arr1[i] !== arr2[i])
			return false;
	}

	return true;
}