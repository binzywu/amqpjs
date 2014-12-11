var amqp = require("../lib/index");
var bytebuffer = require("bytebuffer");
var Long = require("long");
var uuid = require("uuid");

/*var dl = new amqp.describedList({
    code: 1,
    symbol: "a"
}, 2);
dl.fields[0] = 123;
dl.fields[1] = "amqp";
amqp.encoder.addDescribed(dl.descriptor.symbol, dl.descriptor.code, function(d) {
    return new amqp.describedList(d, 2);
});
var buffer = new bytebuffer(16, false);
amqp.encoder.encode(buffer, dl);
buffer.reset();
var decoded = amqp.encoder.decode(buffer);
console.log(decoded);


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

function createDescribedValue(descriptor, value) {
    return new amqp.describedValue(descriptor, value);
}
var frame = new amqp.open();
frame.containerId = 123;
frame.hostname = "test";
frame.outgoingLocales = ["en-us", "cn-zh"];
frame.properties = {
    property1: "abc"
};
var buffer = new bytebuffer();
frame.encode(buffer);
console.log(buffer.toDebug());
buffer.reset();
var decoded = new amqp.open();
decoded.decode(buffer);
console.log(decoded);*/


var buffer = bytebuffer.fromHex("0000004a02000000005110c03d0aa12435366536353864612d626533352d346232662d613030382d633262323435303433303563a1096c6f63616c686f73746140005103404040404040");
var decoded = amqp.frame.getframe(buffer);
console.log(decoded);