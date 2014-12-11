var amqp = require("../lib/index");
var connection = new amqp.connection("amqp://localhost:5672?trace=true");
//var session = new amqp.session(connection);
//var receiver = new amqp.ReceiverLink(session, "receiver-link", "q1");
//var sender = new amqp.SenderLink(session, "sender-link", "q1");
// set credit
// receiver.start(5);

// compare with?
// connection.createSession()?
// session.createLink()?

connection.once("opened", function () {
    var session = new amqp.session(connection);
    session.on("opened", function () {

        var sender = new amqp.SenderLink(session, "sender-link", "q1");
        sender.once("close", function (error) {
            console.log("sender close:" + error);
            session.close();
        });

        sender.once("attached", function () {
            console.log("sender attached");
            
            // start sending message
            
            sender.close();
        });
    });

    session.once("close", function (error) {
        console.log("session close");
        connection.close();
    });
});

connection.once("close", function () {
    console.log("connection close");
});
