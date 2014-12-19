var util = require('util'),
    Link = require("./link").Link,
    target = require("./framing/outcome").target,
    source = require("./framing/outcome").source,
    LinkedList = require("./util/linkedlist").LinkedList,
    Delivery = require("./delivery").delivery,
    Accepted = require("./framing/outcome").accepted,
    ByteBuffer = require("bytebuffer");

// SenderLink
var SenderLink = function (session, name, address) {
    Link.call(this, session, name);
    
    this.outgoingList = new LinkedList();
    var targetframe = new target();
    targetframe.address = address;
    this._sendAttach(false, this.deliveryCount, targetframe, new source());
};

util.inherits(SenderLink, Link);

SenderLink.prototype.close = function (error){
    // some other stuff to clean
    // blocking call for now
    var toRelease;
    while (true) {
        if (!this.writing) {
            toRelease = this.outgoingList.clear();
            break;
        }
    }
    
    Delivery.releaseAll(toRelease);

    // call base
    Link.prototype.close.call(this, error);
}

SenderLink.prototype.send = function (msg, timeout, callback) {
    if (typeof timeout == 'function') {
        callback = timeout;
    }
    
    var delivery = new Delivery();
    delivery.message = msg;
    delivery.buffer = msg.encode();
    delivery.link = this;
    delivery.outcome = callback;
    delivery.settled = callback == null;
    
    if (this.credit <= 0 || this.writing) {
        this.outgoingList.add(delivery);
        return;
    }
        
    this._writeDelivery(delivery);
};

SenderLink.prototype.deliveryStateChanged = function (delivery) {
    if (!delivery.settled) {
        this.session.disposeDelivery(false, delivery, new Accepted(), true);
    }
    
    if (typeof delivery.outcome == 'function') {
        delivery.outcome(delivery.message, delivery.state);
    }
};

SenderLink.prototype.flow = function (flowframe) {
    this.credit = (flowframe.deliveryCount + flowframe.linkCredit) - this.deliveryCount;
    if (this.writing || this.credit <= 0 || !this.outgoingList.head) {
        return;
    }
    
    var delivery = this.outgoingList.head;
    this.outgoingList.remove(delivery);
    this._writeDelivery(delivery);
};

SenderLink.prototype._writeDelivery = function (delivery) {
    // send to session,
    delivery.tag = getDeliveryTag(this.deliveryCount);
    this.credit--;
    this.deliveryCount++;
    this.writing = true;
    
    while (delivery) {
        delivery.handle = this.handle;
        this.session.sendDelivery(delivery);
        
        delivery = this.outgoingList.head;
        if (!delivery) {
            this.writing = false;
        } else if (this.credit > 0) {
            this.outgoingList.remove(delivery);
            delivery.tag = getDeliveryTag(this.deliveryCount);
            this.credit--;
            this.deliveryCount++;
        } else {
            delivery = null;
            this.writing = false;
        }
    }
};

function getDeliveryTag(tag) {
    var buffer = new ByteBuffer();
    buffer.writeInt32(tag);
    return buffer.buffer.slice(0, buffer.offset);
}

exports.SenderLink = SenderLink;
