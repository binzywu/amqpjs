var util = require('util'),
    encoder = require("../codec/encoder").encoder,
    Sasl = require("./Sasl"),
    frame = require("../framing/frame").frame,
    frametype = require("../framing/frame").frametype,
    protocolheader = require("../framing/protocolheader").protocolheader,
    amqpcodec = require("../amqpcodec").amqpcodec,
    ByteBuffer = require("bytebuffer");

var SaslPlainProfile = function(username, password) {
    this.username = username;
    this.password = password;
};

SaslPlainProfile.prototype.open = function(hostname, transport) {
    this._start(hostname, transport);
};

SaslPlainProfile.prototype._start = function(hostname, transport) {
    var header = ByteBuffer.fromHex("414d515003010000");
    transport.write(header);
    console.info("SEND AMQP 3 1 0 0 ");
    var saslinitFrame = this._getInit(hostname);
    sendcmd(transport, saslinitFrame, function(data) {
        console.log(data);
    });
};

SaslPlainProfile.prototype._getInit = function(hostname) {

    var message = new ByteBuffer();
    message.writeUint8(0)
        .writeString(this.username)
        .writeUint8(0)
        .writeString(this.password)
        .compact();

    var init = new Sasl.SaslInit();
    init.mechanism = "PLAIN";
    init.initialResponse = message;
    init.hostname = hostname;

    return init;
};

function sendcmd(transport, cmd, callback) {
    var buffer = frame.getbuffer(frametype.Sasl, 0, cmd, 0);
    transport.write(buffer, callback);
    console.info("SEND " + cmd);
}

exports.SaslPlainProfile = SaslPlainProfile;