//

var fixedwidth = {
	FormatCode: 1,
	Null: 0,
	Boolean: 0,
	BooleanVar: 1,
	Zero: 0,
	UByte: 1,
	UShort: 2,
	UInt: 4,
	ULong: 8,
	Byte: 1,
	Short: 2,
	Int: 4,
	Long: 8,
	Float: 4,
	Double: 8,
	Decimal32: 4,
	Decimal64: 8,
	Decimal128: 16,
	Char: 4,
	TimeStamp: 8,
	Uuid: 16
};

fixedwidth.NullEncoded = fixedwidth.FormatCode + fixedwidth.Null;
fixedwidth.BooleanEncoded = fixedwidth.FormatCode + fixedwidth.Boolean;
fixedwidth.BooleanVarEncoded = fixedwidth.FormatCode + fixedwidth.BooleanVar;
fixedwidth.ZeroEncoded = fixedwidth.FormatCode + fixedwidth.Zero;
fixedwidth.UByteEncoded = fixedwidth.FormatCode + fixedwidth.UByte;
fixedwidth.UShortEncoded = fixedwidth.FormatCode + fixedwidth.UShort;
fixedwidth.UIntEncoded = fixedwidth.FormatCode + fixedwidth.UInt;
fixedwidth.ULongEncoded = fixedwidth.FormatCode + fixedwidth.ULong;
fixedwidth.ByteEncoded = fixedwidth.FormatCode + fixedwidth.Byte;
fixedwidth.ShortEncoded = fixedwidth.FormatCode + fixedwidth.Short;
fixedwidth.IntEncoded = fixedwidth.FormatCode + fixedwidth.Int;
fixedwidth.LongEncoded = fixedwidth.FormatCode + fixedwidth.Long;
fixedwidth.FloatEncoded = fixedwidth.FormatCode + fixedwidth.Float;
fixedwidth.DoubleEncoded = fixedwidth.FormatCode + fixedwidth.Double;
fixedwidth.Decimal32Encoded = fixedwidth.FormatCode + fixedwidth.Decimal32;
fixedwidth.Decimal64Encoded = fixedwidth.FormatCode + fixedwidth.Decimal64;
fixedwidth.Decimal128Encoded = fixedwidth.FormatCode + fixedwidth.Decimal128;
fixedwidth.CharEncoded = fixedwidth.FormatCode + fixedwidth.Char;
fixedwidth.TimeStampEncoded = fixedwidth.FormatCode + fixedwidth.TimeStamp;
fixedwidth.UuidEncoded = fixedwidth.FormatCode + fixedwidth.Uuid;

exports.fixedwidth = fixedwidth;