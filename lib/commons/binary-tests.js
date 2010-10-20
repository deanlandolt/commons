var info = require("./console").info;
var assert = require("./assert");
var binary = require("./binary");


// TODO test NativeBinary and Binary hierarchy before shimming


binary.shim();

var s1 = "abc";
var a1 = [97, 98, 99];
var b1 = binary.NativeBinary(s1);
var b2 = binary.NativeBinary(a1);
var b3 = binary.NativeBinary(s1 + "d");


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

var bLarge = binary.NativeBinary(256);
assert.equal(bLarge.length, 256);


// BinarySubsettable Interface

if (binary.Binary.prototype.subset) {
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

info("binary tests completed successfully")