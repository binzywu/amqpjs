var util = require('util'),
	Link = require("./link").Link,
	target = require("./framing/outcome").target,
	source = require("./framing/outcome").source,
	linkedlist = require("./util/linkedlist").linkedlist,
	Delivery = require("./delivery").delivery;

// SenderLink
var SenderLink = function(session, name, address) {
	Link.call(this, session, name);

	this.outgoingList = new linkedlist();
	this.deliveryCount = 0;
	var targetframe = new target();
	targetframe.address = address;
	this._sendAttach(false, this.deliveryCount, targetframe, new source());
};

util.inherits(SenderLink, Link);

SenderLink.prototype.send = function(msg) {
	//
	var delivery = new Delivery();
};

exports.SenderLink = SenderLink;
