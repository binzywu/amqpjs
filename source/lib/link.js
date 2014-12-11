var util = require('util'),
	events = require('events'),
	Attach = require("./framing/attach").attach,
	Detach = require("./framing/detach").detach;

var State = {
	Start: 0,
	AttachSent: 1,
	AttachReceived: 2,
	Attached: 3,
	DetachPipe: 4,
	DetachSent: 5,
	DetachReceived: 6,
	End: 7
};

// Links
var Link = function(session, name) {
	events.EventEmitter.call(this);
	this.session = session;
	this.name = name;
	this.handle = session.addLink(this);
	this.state = State.Start;
};

util.inherits(Link, events.EventEmitter);

Link.prototype.close = function(error) {
	// 
	if (this.state === State.End) {
		return;
	} else if (this.state === State.AttachSent) {
		this.state = State.DetachPipe;
	} else if (this.state === State.Attached) {
		this.state = State.DetachSent;
	} else if (this.state === State.DetachReceived) {
		this.state = State.End;
	} else {
		throw new Error("Illegal operation on Link close when state: " + this.state);
	}

	this._sendDetach();
};

Link.prototype._onAttach = function(handle, attachframe) {

	if (this.state === State.AttachSent) {
		this.state = State.Attached;
	} else if (this.state === State.DetachPipe) {
		this.state = State.DetachSent;
	} else {
		throw new Error("Illegal operation on Link attach when state: " + this.state);
	}

	if (typeof this.handleAttach == "function") {
		this.handleAttach(attachframe);
	}

	if (attachframe.target && attachframe.source) {
		this.emit("attached", attachframe.target, attachframe.source);
	}
};

Link.prototype._onDetach = function(detachframe) {
	if (this.state === State.DetachSent) {
		this.state = State.End;
	} else if (this.state === State.Attached) {
		this._sendDetach();
		this.state = State.End;
	} else {
		throw new Error("Illegal operation on Link detach when state: " + this.state);
	}

	this.close(detachframe.error);
	this.emit("close", detachframe.error);
};

Link.prototype._onFlow = function(flowframe) {
	// no-op
};

Link.prototype._onTransfer = function(delivery, transferframe, buffer) {
	// no-op
};

Link.prototype._sendDetach = function() {
	var detachframe = new Detach();
	detachframe.handle = this.handle;
	detachframe.close = true;
	this.session._sendcmd(detachframe);
};

Link.prototype._sendAttach = function(role, initialDeliveryCount, target, source) {
	if (this.state !== State.Start) {
		throw new Error("state must be Start...");
	}

	this.state = State.AttachSent;
	var attachframe = new Attach();
	attachframe.linkname = this.name;
	attachframe.handle = this.handle;
	attachframe.role = role;
	attachframe.source = source;
	attachframe.target = target;

	if (!role) {
		attachframe.initialDeliveryCount = initialDeliveryCount;
	}

	this.session._sendcmd(attachframe);
};

Link.prototype._sendDetach = function() {
	var detachframe = new Detach();
	detachframe.handle = this.handle;
	detachframe.closed = true;
	this.session._sendcmd(detachframe);
};

Link.prototype._throwIfDetach = function(operation) {
	if (this.state >= State.DetachPipe) {
		throw new Error("Illegal state: " + this.state);
	}
};

exports.Link = Link;