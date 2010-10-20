// Adapted from http://github.com/280north/narwhal

// Hash object

// -- tlrobinson Tom Robinson

var Hash = exports.Hash = {};

Hash.merge = function(hash, other) {
    var merged = {};
    if (hash) Hash.update(merged, hash);
    if (other) Hash.update(merged, other);
    return merged;
}

Hash.update = function(hash, other) {
    for (var key in other)
        hash[key] = other[key];
    return hash;
}

Hash.forEach = function(hash, block) {
    for (var key in hash)
        block(key, hash[key]);
}

Hash.map = function(hash, block) {
    var result = [];
    for (var key in hash)
        result.push(block(key, hash[key]));
    return result;
}


// HashP : Case Preserving hash, useful for headers, among other things

var HashP = exports.HashP = {};

HashP.get = function(hash, key) {
    var ikey = _findKey(hash, key);
    if (ikey !== null)
        return hash[ikey];
    // not found
    return undefined;
}

HashP.set = function(hash, key, value) {
    // do case insensitive search, and delete if present
    var ikey = _findKey(hash, key);
    if (ikey && ikey !== key)
        delete hash[ikey];
    // set it, preserving key case
    hash[key] = value;
}

HashP.unset = function(hash, key) {
    // do case insensitive search, and delete if present
    var ikey = _findKey(hash, key),
        value;
    if (ikey) {
        value = hash[ikey];
        delete hash[ikey];
    }
    return value;
}

HashP.includes = function(hash, key) {
    return HashP.get(hash, key) !== undefined
}

HashP.merge = function(hash, other) {
    var merged = {};
    if (hash) HashP.update(merged, hash);
    if (other) HashP.update(merged, other);
    return merged;
}

HashP.update = function(hash, other) {
    for (var key in other)
        HashP.set(hash, key, other[key]);
    return hash;
}

HashP.forEach = Hash.forEach;
HashP.map = Hash.map;

function _findKey(hash, key) {
    // optimization
    if (hash[key] !== undefined)
        return key;
    // case insensitive search
    var key = key.toLowerCase();
    for (var i in hash)
        if (i.toLowerCase() === key)
            return i;
    return null;
}
