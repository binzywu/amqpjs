var Header = require('./framing/message').Header,
    Footer = require('./framing/message').Footer,
    DeliveryAnnotations = require('./framing/message').DeliveryAnnotations,
    Properties = require('./framing/message').Properties,
    ApplicationProperties = require('./framing/message').ApplicationProperties,
    AmqpSequence = require('./framing/message').AmqpSequence,
    AmqpValue = require('./framing/message').AmqpValue,
    Data = require('./framing/message').Data,
    ByteBuffer = require("bytebuffer"),
    AmqpCodec = require("./amqpcodec").amqpcodec,
    ErrorCode = require("./errorcode").errorcode,
    Encoder = require('./codec/encoder').encoder;

var Message = function (body) {
    // header, deliveryAnnotations, messageAnnotations, properties, appplicationProperties, 
    // footer, body
    // delivery
    if (body) {
        this.body = new AmqpValue(body);
    }
};

Message.prototype.encode = function () {
    var buffer = new ByteBuffer();
    if (this.header) Encoder.encode(buffer, this.header);
    if (this.deliveryAnnotations) Encoder.encode(buffer, this.deliveryAnnotations);
    if (this.messageAnnotations) Encoder.encode(buffer, this.messageAnnotations);
    if (this.properties) Encoder.encode(buffer, this.properties);
    if (this.applicationProperties) Encoder.encode(buffer, this.applicationProperties);
    if (this.body) Encoder.encode(buffer, this.body);
    if (this.footer) Encoder.encode(buffer, this.footer);
    return buffer;
};

Message.prototype.decode = function (buffer) {
    while (buffer.remaining() > 0) {
        var described = Encoder.decode(buffer);
        var code = described.descriptor.code || described.descriptor;
        if (code === AmqpCodec.Header.code) {
            this.header = described;
        } else if (code === AmqpCodec.DeliveryAnnotations.code) {
            this.deliveryAnnotations = described;
        } else if (code === AmqpCodec.MessageAnnotations.code) {
            this.messageAnnotations = described;
        } else if (code === AmqpCodec.Properties.code) {
            this.properties = described;
        } else if (code === AmqpCodec.ApplicationProperties.code) {
            this.applicationProperties = described;
        } else if (code === AmqpCodec.AmqpValue.code || code === AmqpCodec.Data.code || code === AmqpCodec.AmqpSequence.code) {
            this.body = described;
        } else if (code === AmqpCodec.Footer.code) {
            this.Footer = described;
        } else {
            throw new Error(ErrorCode.FramingError);
        }
    }

    return this;
};

exports.Message = Message;