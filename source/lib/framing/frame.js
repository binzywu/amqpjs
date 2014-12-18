// frame
var util = require('util'),
    encoder = require("../codec/encoder").encoder,
    amqpcodec = require("../amqpcodec").amqpcodec,
    open = require("./open").open,
    begin = require("./begin").begin,
    attach = require("./attach").attach,
    flow = require("./flow").flow,
    transfer = require("./transfer").transfer,
    Disposition = require("./disposition").Disposition,
    detach = require("./detach").detach,
    end = require("./end").end,
    close = require("./close").close,
    error = require("./error").error,
    outcome = require("./outcome");
    bytebuffer = require("bytebuffer");

// add all framing desribeds.
encoder.addDescribed(amqpcodec.Open.code, function() {
    return new open();
});
encoder.addDescribed(amqpcodec.Begin.code, function() {
    return new begin();
});
encoder.addDescribed(amqpcodec.Attach.code, function() {
    return new attach();
});
encoder.addDescribed(amqpcodec.Flow.code, function() {
    return new flow();
});
encoder.addDescribed(amqpcodec.Transfer.code, function() {
    return new transfer();
});
encoder.addDescribed(amqpcodec.Disposition.code, function() {
    return new Disposition();
});
encoder.addDescribed(amqpcodec.Detach.code, function() {
    return new detach();
});
encoder.addDescribed(amqpcodec.End.code, function() {
    return new end();
});
encoder.addDescribed(amqpcodec.Close.code, function() {
    return new close();
});
encoder.addDescribed(amqpcodec.Error.code, function() {
    return new error();
});

// outcome
encoder.addDescribed(amqpcodec.Target.code, function() {
    return new outcome.target();
});
encoder.addDescribed(amqpcodec.Source.code, function() {
    return new outcome.source();
});
encoder.addDescribed(amqpcodec.Received.code, function() {
    return new outcome.received();
});
encoder.addDescribed(amqpcodec.Accepted.code, function() {
    return new outcome.accepted();
});
encoder.addDescribed(amqpcodec.Rejected.code, function() {
    return new outcome.rejected();
});
encoder.addDescribed(amqpcodec.Modified.code, function() {
    return new outcome.modified();
});

// 

var DOF = 2;
var CommandBufferSize = 128;

function encodeFrame(buffer, frametype, channel, command) {
    buffer.writeUint32(0)
            .writeUint8(DOF)
            .writeUint8(frametype)
            .writeUint16(channel);
    if (command && command.encode) {
        command.encode(buffer);
    }
}

exports.frame = {
    getframe: function(buffer) {
        // 0u
        buffer.readUint32();
        // DOF=2
        buffer.readUint8();
        // type, 0 = amqp, 1 = sasl
        buffer.readUint8();
        var channel = buffer.readUint16();
        var command = encoder.decode(buffer);
        return {
            channel: channel,
            command: command
        }
    },
    encodeTransfer: function (frametype, channel, transfer, payload, maxFrameSize) {
        // payload is an instance of bytebuffer which has two offset
        // 1. markedoffset which is used to mark how much payload is completed
        // 2. offset which is the actual length of the payload.
        var bufferSize = CommandBufferSize + payload.offset;
        if (bufferSize > maxFrameSize) {
            bufferSize = maxFrameSize;
        }

        var more = false;
        if (payload.offset > bufferSize - 32) {
            transfer.more = more = true;
        }

        var buffer = new bytebuffer();
        buffer.limit = bufferSize;
        encodeFrame(buffer, frametype, channel, transfer);
        
        if (more && payload.offset <= buffer.offset) {
            transfer.more = false;
            buffer.reset();
            encodeFrame(buffer, frametype, channel, transfer);
        }

        var payloadSize = Math.min(payload.offset, bufferSize - buffer.offset);
        // copy payload to buffer
        payload.slice(payload.markedOffset, payloadSize).copyTo(buffer, buffer.offset, 0, payloadSize);
        payload.mark(payload.markedOffset + payloadSize);
        
        // length
        buffer.writeInt32(buffer.offset, 0);

        return {
            buffer: buffer,
            payloadSize: payloadSize
        };
    },
    encodeCommand: function(frametype, channel, command) {
        var buffer = new bytebuffer();
        encodeFrame(buffer, frametype, channel, command);
        buffer.writeInt32(buffer.offset, 0);
        return buffer;
    }
};

exports.frametype = {
    amqp: 0,
    sasl: 1
};