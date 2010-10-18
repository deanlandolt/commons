// normalize to node encodings
var encodings = {
    "utf-8": "utf8"
};

exports.shim = function() {}; // noop for now, still need to refactor


var normalizeEncoding = exports.normalizeEncoding = function(encoding) {
    encoding = encoding || "utf-8";
    if (typeof encoding !== "string") return encoding;
    encoding = encoding.toLowerCase();
    return encodings[encoding] || encoding;
};


// Binary

var Binary = exports.Binary = Buffer;


// TODO feature-test before replacing?
var originalToString = Buffer.prototype.toString;
Buffer.prototype.toString = function(encoding) {
    return originalToString.call(this, normalizeEncoding(encoding));
};

if (!String.prototype.getBytes) {
    String.prototype.getBytes = function(encoding) {
        return Buffer(this.toString(), normalizeEncoding(encoding));
    };
}

// TODO Array.prototype.getBytes

if (!Buffer.prototype.getBytes) {
    Buffer.prototype.getBytes = function() {
        return this;
    };
}

// Buffer.prototype.get already defined


// BinaryMutable

// Buffer.prototype.set already defined


// TODO Buffer.prototype.write/copy already defined, do we need anything else?
// TODO copyFrom? fill? read? why not?



// BinaryBuffer

// detect if Buffer's slice returns copy or ref
function hasCopySlice() {
    var b = Buffer([97, 98]).slice(1,2)[0] = 99;
    return b[1] !== 98;
};


if (hasCopySlice()) {
    Buffer.prototype.subset = Buffer.prototype.slice;
    Buffer.prototype.slice = function(start, end) {
        start = start || 0;
        end = end || this.length;
        if (typeof start !== "number")
            throw new Error("Start must exist for now");
        var buffer = new Buffer(end - start);
        this.copy(buffer, 0, start, end);
        return buffer;
    };
}


// non-standard extras

exports.isBinary = Buffer.isBuffer;

exports.byteLength = Buffer.byteLength;


if (!Buffer.prototype.forEach) {
    Buffer.prototype.forEach = function(fn, thisp) {
        if (this === void 0 || this === null || typeof fn !== "function")
            throw new TypeError();
        var t = Object(this);
        for (var i = 0, len = this.length; i < len; i++) {
            fn.call(thisp, t[i], i, t);
        }
    };
}

if (!Buffer.prototype.toSource) {
    Buffer.prototype.toSource = function() {
        var bytes = [];
        this.forEach(function(b) {
            bytes.push(b);
        });
        return '(require("commonjs/binary").NativeBinary([' + bytes + "]))";
    }
}


var NativeBinary = exports.NativeBinary = function() {
    // if (!this instanceof NativeBinary)
    return Buffer.apply(this, arguments);
};
