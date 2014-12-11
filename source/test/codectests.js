var amqp = require("../lib/index");
var bytebuffer = require("bytebuffer");
var Long = require("long");
var uuid = require("uuid");

module.exports = {

	testPrimitiveCodec: function(test) {

		var tests = [
			["boolean true", true, [0x41]],
			["boolean false", false, [0x42]],
			["string value", "amqp", [0xa1, 0x04, 0x61, 0x6d, 0x71, 0x70]],
			["string object value", new String("amqp"), [0xa1, 0x04, 0x61, 0x6d, 0x71, 0x70]],
			["byte >= 128 as ubyte", 0xFF, [0x50, 0xFF]],
			["byte >= -128 & byte <= 127 as byte", -128, [0x51, 0x80]],
			["short", 0x5678, [0x61, 0x56, 0x78]],
			["int", 0x56789a00, [0x71, 0x56, 0x78, 0x9a, 0x00]],
			["long", -0x80000001, [0x81, 0xff, 0xff, 0xff, 0xff, 0x7f, 0xff, 0xff, 0xff]],
			["long", 0x80000000, [0x81, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]],
			["ulong", Long.MAX_UNSIGNED_VALUE, [0x80, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]],
			["ulong", Long.MAX_UNSIGNED_VALUE.toNumber(), [0x80, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]],
			["ulong", new Number(Long.MAX_UNSIGNED_VALUE.toNumber()), [0x80, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]],
			["double", 111111111111111.22222222222, [0x82, 0x42, 0xd9, 0x43, 0x84, 0x93, 0xbc, 0x71, 0xce]],
			// char? what i can do with it?

			// datetime, timestamp
			["timestamp", new Date("2008-11-01T19:35:00.0000000Z"), [0x83, 0x00, 0x00, 0x01, 0x1d, 0x59, 0x8d, 0x1e, 0xa0],
				function(v1, v2) {
					return v1.getTime() == v2.getTime();
				}
			],

			// binary
			["binary8", new Uint8Array([1, 2, 3, 4]), [0xa0, 0x04, 0x01, 0x02, 0x03, 0x04], simpleBufferEqual],

			// string
			["string", "amqp", [0xa1, 0x04, 0x61, 0x6d, 0x71, 0x70]],
			["string", new String("amqp"), [0xa1, 0x04, 0x61, 0x6d, 0x71, 0x70]],

			// uuid, todo: revisit.	
			["uuid", {
					"!type": "uuid",
					value: uuid.parse("f275ea5e-0c57-4ad7-b11a-b20c563d3b71")
				},
				[0x98, 0xf2, 0x75, 0xea, 0x5e, 0x0c, 0x57, 0x4a, 0xd7, 0xb1, 0x1a, 0xb2, 0x0c, 0x56, 0x3d, 0x3b, 0x71],
				function(v1, v2) {
					return v1 == uuid.unparse(v2.value);
				}
			],

			// symbol
			["symbol", new amqp.symbol("amqp"), [0xa3, 0x04, 0x61, 0x6d, 0x71, 0x70],
				function(v1, v2) {
					return v1.value == v2.value;
				}
			],

		];

		tests.forEach(function(tc) {
			var buffer = new bytebuffer(16, false);
			amqp.encoder.encode(buffer, tc[1]);
			// buffer.buffer is Buffer in node.js... which is better as it has [] access.
			var nodeBuffer = buffer.buffer.slice(0, buffer.offset);
			// console.log(nodeBuffer);
			test.ok(simpleBufferEqual(nodeBuffer, tc[2]), tc[0] + ", buffer value:" + buffer.toDebug() + ", v: " + tc[2]);
			buffer.offset = 0;
			var decodedResult = amqp.encoder.decode(buffer);
			if (!tc[3]) {
				test.equal(decodedResult, tc[1], tc[0] + ", decoded result: " + 　decodedResult);
			} else {
				test.ok(tc[3](decodedResult, tc[1]), tc[0] + ", decoded result: " + 　decodedResult);
			}
		});

		var list = [];
		tests.forEach(function(tc) {
			list.push(tc[1]);
		});

		var buffer1 = new bytebuffer();
		amqp.encoder.encode(buffer1, list);
		buffer1.offset = 0;
		var result = amqp.encoder.decode(buffer1);

		for (var i = 0; i < result.length; i++) {
			var tc = tests[i];
			if (tc[3]) {
				test.ok(tc[3](result[i], tc[1]), tc[0] + ", decoded result: " + result[i]);
			} else {
				test.equal(result[i], tc[1], tc[0] + ", decoded result: " + result[i]);
			}
		}

		test.done();
	},

	testList0: function(test) {
		var data = {"!type": "list0", value: []};
		var buffer = new bytebuffer(16, false);
		amqp.encoder.encode(buffer, data);
		buffer.offset = 0;
		var decodedData = amqp.encoder.decode(buffer);
		test.equal(decodedData.length, 0);
		test.ok(Array.isArray(decodedData));
		test.done();
	},

	testDescribedValues: function(test) {

		var testcases = [
			["d1", createDescribedValue(100, "value1")],
			["d2", createDescribedValue("v2", 3.14159)],
			["d3", createDescribedValue("v3", {
					// TODO: revisit uuid
					"!type": "uuid",
					value: uuid()
				}),
				function(v1, v2) {
					return v1.value == v2.value.value;
				}
			],
			["d4",
				createDescribedValue(null, [100, "amqp"]), simpleBufferEqual
			],
		];

		testcases.forEach(function(tc) {
			var buffer = new bytebuffer(16, false);
			var d = tc[1];
			d.encode(buffer);
			buffer.reset();
			var dd = createDescribedValue(d.descriptor);
			dd.decode(buffer);
			test.equal(dd.descriptor, d.descriptor, tc[0] + ", descriptor: " + dd.descriptor);
			if (!tc[2]) {
				test.equal(dd.value, d.value, tc[0] + ", value: " + dd.value);
			} else {
				test.ok(tc[2](dd.value, d.value), tc[0] + ", dd value: " + dd.value + ", d value: " + d.value.toString());
			}
		});


		var d5 = createDescribedValue({
			code: 123,
			name: "amqp"
		}, [100, "amqp"]);
		var buffer = new bytebuffer(16, false);
		d5.encode(buffer);
		buffer.reset();
		var d5d = createDescribedValue({
			code: 0,
			name: ""
		});
		d5d.decode(buffer);
		test.equal(d5d.descriptor.code, 123);
		test.equal(d5d.descriptor.name, "amqp");
		simpleBufferEqual(d5d.value, d5.value);
		test.done();
	},

	testDescribedList: function(test) {
		var dl = new amqp.describedList(1, 2);
		dl.fields[0] = 123;
		dl.fields[1] = "amqp";
		amqp.encoder.addDescribed(1, function(d) {
			return new amqp.describedList(d, 2);
		});
		var buffer = new bytebuffer(16, false);
		amqp.encoder.encode(buffer, dl);
		buffer.reset();
		var decoded = amqp.encoder.decode(buffer);
		test.equal(decoded.descriptor.code, dl.descriptor.code);
		test.equal(decoded.fields[0], dl.fields[0]);
		test.equal(decoded.fields[1], dl.fields[1]);
		test.done();
	}
};
function createDescribedValue(descriptor, value) {
	return new amqp.describedValue(descriptor, value);
}

function simpleBufferEqual(buffer, arr2) {
	buffer = buffer.buffer || buffer;
	if (buffer.length !== arr2.length) {
		return false;
	}
	for (var i = buffer.length; i--;) {
		if (buffer[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}