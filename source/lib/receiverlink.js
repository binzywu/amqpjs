var util = require('util'),
	Link = require("./link").Link,
	source = require("./framing/outcome").source,
	target = require("./framing/outcome").target,
	linkedlist = require("./util/linkedlist").linkedlist;
// senderlink

var ReceiverLink = function(session, name, address) {
	Link.call(this, session, name);

	this.receivedMessages = new linkedlist();
	var sourceframe = new source();
	sourceframe.address = address;
	this._sendAttach(false, 0, new target(), sourceframe);
};

util.inherits(ReceiverLink, Link);

ReceiverLink.prototype.start = function(credit) {
	//
};

ReceiverLink.prototype.handleAttach = function(attachframe) {
	
};

exports.ReceiverLink = ReceiverLink;
