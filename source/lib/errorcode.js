//

var errorcode = {
	// amqp errors
	InternalError: "amqp:internal-error",
	NotFound: "amqp:not-found",
	UnauthorizedAccess: "amqp:unauthorized-access",
	DecodeError: "amqp:decode-error",
	ResourceLimitExceeded: "amqp:resource-limit-exceeded",
	NotAllowed: "amqp:not-allowed",
	InvalidField: "amqp:invalid-field",
	NotImplemented: "amqp:not-implemented",
	ResourceLocked: "amqp:resource-locked",
	PreconditionFailed: "amqp:precondition-failed",
	ResourceDeleted: "amqp:resource-deleted",
	IllegalState: "amqp:illegal-state",
	FrameSizeTooSmall: "amqp:frame-size-too-small",

	// connection errors
	ConnectionForced: "amqp:connection:forced",
	FramingError: "amqp:connection:framing-error",
	ConnectionRedirect: "amqp:connection:redirect",

	// session errors
	WindowViolation: "amqp:session:window-violation",
	ErrantLink: "amqp:session-errant-link",
	HandleInUse: "amqp:session:handle-in-use",
	UnattachedHandle: "amqp:session:unattached-handle",

	// link errors
	DetachForced: "amqp:link:detach-forced",
	TransferLimitExceeded: "amqp:link:transfer-limit-exceeded",
	MessageSizeExceeded: "amqp:link:message-size-exceeded",
	LinkRedirect: "amqp:link:redirect",
	Stolen: "amqp:link:stolen",

	// tx error conditions
	TransactionUnknownId: "amqp:transaction:unknown-id",
	TransactionRollback: "amqp:transaction:rollback",
	TransactionTimeout: "amqp:transaction:timeout"
};

exports.errorcode = errorcode;