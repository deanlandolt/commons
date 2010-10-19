if (!require.main) require.main = module;

// load runtime's binary module
var process = require("./process");
var binaryModule = require("./binary/runtime/" + process.runtime);
for (var key in binaryModule) exports[key] = binaryModule[key];

exports.shim = function() {
    binaryModule.shim(); // TODO node's shim is still a noop
};

// TODO split me up and and move some of me to ./binary/runtime/default


// TODO these don't need to be abstract interfaces:
// we can set Binary to inherit from binaryModule.NativeBinary and set all proto
// methods to undefined, then enhance it with each api


// Abstract Interfaces

var Binary = exports.Binary = function() {
    throw new Error("Cannot invoke interface");
};
Binary.prototype = {
    get: function() {},
    toString: function() {} // TODO enumerable: false?
};
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


exports.test = function() {
    var assert = require("./assert");
    
    // TODO test NativeBinary and Binary hierarchy before shimming
    
    
    exports.shim();
    
    var s1 = "abc";
    var a1 = [97, 98, 99];
    var b1 = exports.NativeBinary(s1);
    var b2 = exports.NativeBinary(a1);
    var b3 = exports.NativeBinary(s1 + "d");
    
    
    // Binary Interface
    
    assert.deepEqual(b1, b2);
    assert.notDeepEqual(b1, b3);
    assert.notDeepEqual(b2, b3);
    
    // get
    
    assert.equal(b1.get(1), 98);
    assert.equal(b2.get(1), 98);
    assert.equal(b3.get(1), 98);
    
    // getBytes
    
    assert.deepEqual(b1, b2.getBytes().getBytes());
    assert.equal(b1, b1.getBytes().getBytes());
    
    // slice
    assert.deepEqual(b1, b1.slice());
    assert.equal(b1.get(1), b1.slice(1,2).get(0));
    assert.deepEqual(s1.getBytes(), b1);
    assert.deepEqual(s1.getBytes().getBytes(), b2);
    assert.notDeepEqual(s1.getBytes(), b3);
    
    
    // BinaryMutable  Interface
    
    // set
    
    assert.equal(b1.get(1), 98);
    var bSlice = b1.slice();
    assert.equal(bSlice.set(1, 99), 99);
    assert.equal(bSlice.get(1), 99);
    assert.equal(b1.get(1), 98);
    
    
    // BinaryFixedLength Interface
    
    var bLarge = exports.NativeBinary(256);
    assert.equal(bLarge.length, 256);
    
    
    // BinarySubsettable Interface
    
    if (exports.Binary.prototype.subset) {
        var bSubset = bSlice.subset(1,2);
        // TODO actually test
    }
    
    
    // extras
    
    // TODO remove prototype.forEach on everything but ByteArray
    var a2 = [];
    b1.forEach(function(chunk) {
        a2.push(chunk);
    });
    
    assert.deepEqual(a2, a1);
    var bToSource = '(require("commonjs/binary").NativeBinary([' + a1 + ']))';
    assert.equal(b1.toSource(), bToSource);
    assert.equal(b2.toSource(), bToSource);
    
    process.print("binary tests completed successfully")
};

if (require.main === module) exports.test();