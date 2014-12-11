
var delivery = function() {
	// message
	// buffer
	// tag
	// deliveryId
	// bytesTransferred
	// state -> deliverystate
	// settled
	// link

	// node-> prev, next
};

delivery.releaseAll = function (deliveryToRelease, error) {

};

// todo
delivery.prototype.setMessage = function(message){
	this.message = message;
	this.message.delivery = this;
};

delivery.prototype.changeState = function(state) {
	this.state = state;
	this.link.changeDeliveryState(this);
};

exports.delivery = delivery; 