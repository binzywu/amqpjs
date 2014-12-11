// a simple linked list

// node has prev and next.

var linkedlist = function() {

};

linkedlist.prototype.add = function(node) {
	if (!this.head) {
		this.head = this.tail = node;
	} else {
		if (!this.tail) {
			throw new Error("Wrong linkedlist");
		}

		this.tail.next = node;
		node.prev = this.tail;
		this.tail = node;
	}
};

linkedlist.prototype.remove = function(node) {
	if (!node) {
		throw new Error("node cannot be null.");
	}

	if (node === this.head) {
		this.head = node.next;
		if (!this.head) {
			this.tail = null;
		} else {
			this.head.prev = null;
		}
	} else if (node === this.tail) {
		this.tail = node.prev;
		this.tail.next = null;
	} else if (node.prev && node.next) {
		node.prev.next = node.next;
		node.next.prev = node.prev;
	}

	node.prev = node.next = null;
};

linkedlist.prototype.clear = function() {
	var first = this.head;
	this.head = this.tail = null;
	return first;
};

exports.linkedlist = linkedlist;