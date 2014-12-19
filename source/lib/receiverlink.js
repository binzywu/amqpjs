var util = require('util'),
    Link = require("./link").Link,
    ErrorCode = require("./errorcode").errorcode,
    Message = require("./message").Message,
    Accept = require("./framing/outcome").accept,
    Release = require("./framing/outcome").release,
    Reject = require("./framing/outcome").reject,
    source = require("./framing/outcome").source,
    target = require("./framing/outcome").target,
    LinkedList = require("./util/linkedlist").LinkedList,
    ByteBuffer = require("bytebuffer");

var ReceiverLink = function (session, name, address) {
    Link.call(this, session, name);
    
    this.receivedMessages = new LinkedList();
    var sourceframe = new source();
    sourceframe.address = address;
    this._sendAttach(false, 0, new target(), sourceframe);
};

util.inherits(ReceiverLink, Link);

ReceiverLink.prototype.close = function (error) {
    // anything special here?
    
    // call base
    Link.prototype.close.call(this, error);
};

// ? do we need this?
ReceiverLink.prototype.start = function (credit) {
    //
    this.setCredit(credit, true);
};

ReceiverLink.prototype.setCredit = function (credit, autoRestore) {
    if (this._detaching()) {
        return;
    }
    
    this.totalCredit = autoRestore ? credit : 0;
    this.credit = credit;
    this.restored = 0;
    this._sendFlow(this.deliveryCount, credit);
}

ReceiverLink.prototype.accept = function (msg) {
    this._throwIfDetach("accept");
    this._disposeMessage(msg, new Accept());
};

ReceiverLink.prototype.release = function () {
    this._throwIfDetach("release");
    this._disposeMessage(msg, new Release());
};

ReceiverLink.prototype.reject = function (msg, error) {
    this._throwIfDetach("reject");
    var rejectFrame = new Reject();
    rejectFrame.error = error;
    this._disposeMessage(msg, rejectFrame)
};

ReceiverLink.prototype.handleAttach = function (attachframe) {
    this.deliveryCount = attachframe.initialDeliveryCount;
};

ReceiverLink.prototype.transfer = function (delivery, transfer, buffer) {
    if (transfer.more) {
        if (!delivery) {
            delivery = this.deliveryCurrent;
            if (!delivery) {
                // throw error.
            }
            
            var remaining = buffer.remaining();
            buffer.copyTo(delivery.buffer, delivery.buffer.offset, 0, remaining);
            delivery.buffer.offset = delivery.buffer.offset + remaining;
        } else {
            this._onDelivery(transfer.deliveryId);
            delivery.buffer = new ByteBuffer();
            
            // TODO: set delivery.buffer.limit
            buffer.copyTo(delivery.buffer, delivery.buffer.offset, 0, remaining);
            delivery.buffer.offset = delivery.buffer.offset + remaining;
            this.deliveryCurrent = delivery;
        }
    } else {
        if (!delivery) {
            // multi
            delivery = this.deliveryCurrent;
            if (!delivery) {
                // throw error.
            }
            
            var remaining = buffer.remaining();
            buffer.copyTo(delivery.buffer, delivery.buffer.offset, 0, remaining);
            delivery.message = (new Message()).decode(delivery.buffer.reset())
            delivery.buffer = null;
        } else {
            // single
            this._onDelivery(transfer.deliveryId);
            delivery.message = (new Message()).decode(buffer);
        }
        
        // emit event
        this.emit("message", delivery.message);
        if (this.totalCredit > 0 && this.restored++ >= (this.totalCredit / 2)) {
            this.setCredit(this.totalCredit, true);
        }
    }
};

ReceiverLink.prototype._onDelivery = function (deliveryId) {
    if (this.credit <= 0) {
        throw new Error(ErrorCode.TransferLimitExceeded);
    }
    
    this.deliveryCount++;
    this.credit--;
};

ReceiverLink.prototype._disposeMessage = function (msg, outcome) {

};

exports.ReceiverLink = ReceiverLink;
