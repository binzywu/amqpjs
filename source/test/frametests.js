var amqp = require("../lib/index");
var bytebuffer = require("bytebuffer");
var Long = require("long");
var uuid = require("uuid");
var url = require("url");

module.exports = {

	/*testOpen: function(test) {
		var frame = new amqp.open();
		frame.containerId = uuid.v4();
		frame.hostname = "test";
		frame.idleTimeout = 1234;
		frame.outgoingLocales = ["en-us", "cn-zh"];
		frame.properties = {
			property1: "ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
		};
		var buffer = new bytebuffer();
		frame.encode(buffer);
		buffer.reset();
		var decoded = new amqp.open();
		decoded.decode(buffer);
		test.equal(decoded.descriptor, frame.descriptor);
		test.equal(decoded.properties.property1, frame.properties.property1);
		test.equal(decoded.idleTimeout, frame.idleTimeout);
		test.ok(arraysEqual(decoded.outgoingLocales, frame.outgoingLocales));
		test.done();
	},*/

	testConnection: function(test) {

		var connection = new amqp.connection("amqp://localhost:5672");
		var session = new amqp.session(connection);
		// var receiver = new amqp.ReceiverLink(session, "receiver-link", "q1");
		var sender = new amqp.SenderLink(session, "sender-link", "q1");
		// set credit
		// receiver.start(5);

		// compare with?
		// connection.createSession()?
		// session.createLink()?

		connection.on("close", function() {
			test.done();
		});

		/*receiver.on("message", function(message) {

		});

		receiver.on("close", function(error) {
			console.log("receiver close:" + error);
		});
		receiver.on("closed", function(error) {
			console.log("receiver closed:" + error);
		});
		receiver.on("attach", function() {
			receiver.close();
		});*/

		sender.once("close", function(error) {
			console.log("sender close:" + error);
			// close session
			session.once("close", function(error) {
				console.log("session close");
				connection.once("close", function() {
					console.log("connection close");
				});

				connection.close();
			});
			session.close();
		});

		sender.once("attach", function() {
			console.log("sender attached");
			sender.close();
		});
	}
};

function arraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length)
		return false;
	for (var i = arr1.length; i--;) {
		if (typeof arr1 == "object") {
			for (var key in arr1) {
				if (arr1[key] != arr2[key])
					return false;
			}
		} else {
			if (arr1[i] !== arr2[i]) {
				return false;
			}
		}
	}

	return true;
}