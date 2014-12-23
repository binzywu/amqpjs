var amqp = require("../lib/index");
var connection = new amqp.connection("amqp://localhost:5672");
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
        
        var sender = new amqp.SenderLink(session, "sender-link", "q3");
        //var receiver = new amqp.ReceiverLink(session, "receiver-link", "q3");
        //receiver.start(100);
        
        sender.once("detached", function (error) {
            console.log("sender detached:" + error);
            session.close();
        });
        
        //receiver.once("close", function (error) {
        //    console.log("receiver close:" + error);
        //    session.close();
        //});
        
        sender.once("attached", function () {
            console.log("sender attached");
            
            // start sending message
            for (var i = 0; i < 10; i++) {
                var message = new amqp.Message();
                message.properties = new amqp.Properties();
                message.properties.groupId = 'abcdefg';
                message.applicationProperties = new amqp.ApplicationProperties({ "sn": i });
                sender.send(message);
            }
            
            sender.close();
        });
        
        //var received = 0;
        //receiver.on("message", function (message) {
        //    received++;
        //    console.log(message);
        //    receiver.accept(message);
        //    if (received == 10) {
        //        receiver.off("message");
        //        receiver.close();
        //    }
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
