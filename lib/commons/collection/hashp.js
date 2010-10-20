// Adapted from http://github.com/280north/narwhal

// HashP : Case Preserving hash, useful for headers, among other things

var hash = require("./hash");

exports.get = function(hash, key) {
    var ikey = _findKey(hash, key);
    if (ikey !== null)
        return hash[ikey];
    // not found
    return undefined;
}

exports.set = function(hash, key, value) {
    // do case insensitive search, and delete if present
    var ikey = _findKey(hash, key);
    if (ikey && ikey !== key)
        delete hash[ikey];
    // set it, preserving key case
    hash[key] = value;
}

exports.unset = function(hash, key) {
    // do case insensitive search, and delete if present
    var ikey = _findKey(hash, key),
        value;
    if (ikey) {
        value = hash[ikey];
        delete hash[ikey];
    }
    return value;
}

exports.includes = function(hash, key) {
    return exports.get(hash, key) !== undefined
}

exports.merge = function(hash, other) {
    var merged = {};
    if (hash) exports.update(merged, hash);
    if (other) exports.update(merged, other);
    return merged;
}

exports.update = function(hash, other) {
    for (var key in other)
        exports.set(hash, key, other[key]);
    return hash;
}

exports.forEach = Hash.forEach;
exports.map = Hash.map;

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
