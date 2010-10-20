// load runtime's binary module
var process = require("./process");
var runtimeModule = require("./binary/runtime/" + process.runtime);
for (var key in runtimeModule) exports[key] = runtimeModule[key];

exports.shim = function() {
    // TODO node's shim is still a noop
    runtimeModule.shim();
};


// TODO these don't need to be abstract interfaces:
// we can set Binary to inherit from runtimeModule.NativeBinary and set all proto
// methods to undefined, then enhance it with each api


// Abstract Interfaces

var NativeBinary = exports.NativeBinary;

var Binary = exports.Binary = function() {
    throw new Error("Cannot invoke interface");
};
Binary.prototype = NativeBinary.prototype;
// "clear" Binary proto by setting all own-props to undefined save two
// this is to get Binary to inherit from NativeBinary but have a clean interface
Object.getOwnPropertyNames(Binary.prototype).forEach(function(key) {
    // TODO try/catch in case non-configurable
    if (key !== "get" && key !== "toString") {
        Binary.prototype[key] = void 0;
    }
    // TODO dangle interface fns off of runtime module as BinaryToString et al
});
Binary.prototype.constructor = Binary;


var MutableBinary = exports.MutableBinary = function() {
    throw new Error("Cannot invoke interface");
};
MutableBinary.prototype = Binary.prototype;
MutableBinary.prototype.constructor = MutableBinary;


var MutableLengthBinary = exports.MutableLengthBinary = function() {
    
};
MutableLengthBinary.prototype = MutableBinary.prototype;
MutableLengthBinary.prototype.constructor = MutableLengthBinary;


var SubsettableBinary = exports.SubsettableBinary = function() {
    
};
SubsettableBinary.prototype = MutableBinary.prototype;
SubsettableBinary.prototype.constructor = SubsettableBinary;


// Concrete Interfaces

/*
new Buffer ( Number size );
new Buffer ( Array[Number] source );
new Buffer ( String source, String encoding default="utf-8" );
new Buffer ( Binary source );
*/
var Buffer = exports.Buffer = function(source, encoding) {
    if (!this instanceof Buffer)
        return new Buffer(source, encoding);
    // TODO
};
Buffer.prototype = SubsettableBinary.prototype;
Buffer.prototype.constructor = Buffer;


/*
new ByteArray ( Number size );
new ByteArray ( Array[Number] source );
new ByteArray ( String source, String encoding default="utf-8" );
new ByteArray ( Binary source );
*/
var ByteArray = exports.ByteArray = function(source, encoding) {
    if (!this instanceof ByteArray)
        return new ByteArray(source, encoding);
    // TODO
};
ByteArray.prototype = MutableLengthBinary.prototype;
ByteArray.prototype.constructor = ByteArray;


/*
new ByteString ( Number size );
new ByteString ( Array[Number] source );
new ByteString ( String source, String encoding default="utf-8" );
new ByteString ( Binary source );
*/
var ByteString = exports.ByteString = function(source, encoding) {
    if (!this instanceof ByteString)
        return new ByteString(source, encoding);
    // TODO
};
ByteString.prototype = Binary.prototype;
ByteString.prototype.constructor = ByteString;
