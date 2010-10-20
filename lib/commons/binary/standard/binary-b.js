// normalize to node encodings
var encodings = {
    "utf8": "utf-8",
    "utf16": "utf-16"
};

var normalizeEncoding = exports.normalizeEncoding = function(encoding) {
    encoding = encoding || "utf-8";
    if (typeof encoding !== "string") return encoding;
    encoding = encoding.toLowerCase();
    return encodings[encoding] || encoding;
};


var binaryModule = require("binary");
var Binary = exports.Binary = binaryModule.Binary;
var ByteArray = binaryModule.ByteArray;
var ByteString = binaryModule.ByteString;


exports.shim = function () {
    
    // Binary
    
    if (!String.prototype.getBytes) {
        String.prototype.getBytes = function(encoding) {
            return NativeBinary(this.toString(), normalizeEncoding(encoding));
        };
    }
    
    // TODO Array.prototype.getBytes
    
    // Binary.getBytes should be idempotent
    if (!Binary.prototype.getBytes) {
        Binary.prototype.getBytes = function() {
            return this;
        };
    }
    
    // Binary.prototype.get already defined


    // BinaryMutable
    
    var originalSet = ByteArray.prototype.set;
    ByteArray.prototype.set = function(index, value) {
        if (originalSet) {
            originalSet.call(this, index, value);
        }
        else {
            this[index] = value;
        }
        return value;
    };
    
    // extras
    
    
    NativeBinary.isBinary = exports.isBinary;
    
    NativeBinary.byteLength = exports.byteLength;
    
    // explicitly override the provided toSource
    //if (!Binary.prototype.toSource) {
    Binary.prototype.toSource = function() {
        var bytes = [];
        this.forEach(function(b) {
            bytes.push(b);
        });
        return '(require("commonjs/binary").NativeBinary([' + bytes + "]))";
    }
    ByteArray.prototype.toSource = Binary.prototype.toSource;
    ByteString.prototype.toSource = Binary.prototype.toSource;
};




exports.isBinary = function(target) {
    return target instanceof binaryModule.Binary;
};

exports.byteLength = function(source, encoding) {
    return (new ByteString(string, encoding)).length;
};


var NativeBinary = exports.NativeBinary = function(value, encoding) {
    // if (!this instanceof NativeBinary)
    if (typeof value === "number" || Array.isArray(value))
        return new ByteArray(value);
    return new ByteArray(value, normalizeEncoding(encoding));
};