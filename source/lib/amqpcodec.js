var amqpcodec = {

	// transport performatives
	Open: {
		code: 0x0000000000000010,
		name: "amqp:open:list"
	},
	Begin: {
		code: 0x0000000000000011,
		name: "amqp:begin:list"
	},
	Attach: {
		code: 0x0000000000000012,
		name: "amqp:attach:list"
	},
	Flow: {
		code: 0x0000000000000013,
		name: "amqp:flow:list"
	},
	Transfer: {
		code: 0x0000000000000014,
		name: "amqp:transfer:list"
	},
    Disposition: {
		code: 0x0000000000000015,
		name: "amqp:disposition:list"
	},
	Detach: {
		code: 0x0000000000000016,
		name: "amqp:detach:list"
	},
	End: {
		code: 0x0000000000000017,
		name: "amqp:end:list"
	},
	Close: {
		code: 0x0000000000000018,
		name: "amqp:close:list"
	},

	Error: {
		code: 0x000000000000001d,
		name: "amqp:error:list"
	},

	// outcome
	Received: {
		code: 0x0000000000000023,
		name: "amqp:received:list"
	},
	Accepted: {
		code: 0x0000000000000024,
		name: "amqp:accepted:list"
	},
	Rejected: {
		code: 0x0000000000000025,
		name: "amqp:rejected:list"
	},
	Released: {
		code: 0x0000000000000026,
		name: "amqp:released:list"
	},
	Modified: {
		code: 0x0000000000000027,
		name: "amqp:modified:list"
	},

	Source: {
		code: 0x0000000000000028,
		name: "amqp:source:list"
	},
	Target: {
		code: 0x0000000000000029,
		name: "amqp:target:list"
	},

	// transaction
	Coordinator: {
		code: 0x0000000000000030,
		name: "amqp:coordinator:list"
	},
	Declare: {
		code: 0x0000000000000031,
		name: "amqp:declare:list"
	},
	Discharge: {
		code: 0x0000000000000032,
		name: "amqp:discharge:list"
	},
	Declared: {
		code: 0x0000000000000033,
		name: "amqp:declared:list"
	},
	TxnState: {
		code: 0x0000000000000034,
		name: "amqp:transactional-state:list"
	},

	// sasl
	SaslMechanisms: {
		code: 0x0000000000000040,
		name: "amqp:sasl-mechanisms:list"
	},
	SaslInit: {
		code: 0x0000000000000041,
		name: "amqp:sasl-init:list"
	},
	SaslChallenge: {
		code: 0x0000000000000042,
		name: "amqp:sasl-challenge:list"
	},
	SaslResponse: {
		code: 0x0000000000000043,
		name: "amqp:sasl-response:list"
	},
	SaslOutcome: {
		code: 0x0000000000000044,
		name: "amqp:sasl-outcome:list"
	},

	// message
	Header: {
		code: 0x0000000000000070,
		name: "amqp:header:list"
	},
	DeliveryAnnotations: {
		code: 0x0000000000000071,
		name: "amqp:delivery-annotations:map"
	},
	MessageAnnotations: {
		code: 0x0000000000000072,
		name: "amqp:message-annotations:map"
	},
	Properties: {
		code: 0x0000000000000073,
		name: "amqp:properties:list"
	},
	ApplicationProperties: {
		code: 0x0000000000000074,
		name: "amqp:application-properties:map"
	},
	Data: {
		code: 0x0000000000000075,
		name: "amqp:data:binary"
	},
	AmqpSequence: {
		code: 0x0000000000000076,
		name: "amqp:amqp-sequence:list"
	},
	AmqpValue: {
		code: 0x0000000000000077,
		name: "amqp:amqp-value:*"
	},
	Footer: {
		code: 0x0000000000000078,
		name: "amqp:footer:map"
	}
};

exports.amqpcodec = amqpcodec;