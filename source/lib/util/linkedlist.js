// a simple linked list

// node has prev and next.

var LinkedList = function() {
};

LinkedList.prototype.add = function(node) {
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

LinkedList.prototype.remove = function(node) {
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

LinkedList.prototype.clear = function() {
	var head = this.head;
	this.head = this.tail = null;
	return head;
};

exports.LinkedList = LinkedList;