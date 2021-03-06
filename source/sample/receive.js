var amqp = require("../lib/index");
var connection = new amqp.connection("amqp://localhost:5672");
connection.once("opened", function () {
    var session = new amqp.session(connection);
    session.on("opened", function () {
        var receiver = new amqp.ReceiverLink(session, "receiver-link", "q3");
        receiver.start(100);
        
        receiver.once("detached", function (error) {
            console.log("receiver detached:" + error);
            session.close();
        });
        
        var received = 0;
        receiver.on("message", function (message) {
            received++;
            console.log(message);
            receiver.accept(message);
            if (received == 10) {
                receiver.off("message");
                receiver.close();
            }
        });

        //receiver.on("attached", function () {
        //    receiver.close();
        //});
    });
    
    session.once("close", function (error) {
        console.log("session close");
        connection.close();
    });
});

connection.once("close", function () {
    console.log("connection close");
});
