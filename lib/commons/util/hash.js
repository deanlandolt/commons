// Adapted from http://github.com/280north/narwhal

// Hash object

// -- tlrobinson Tom Robinson

exports.merge = function(hash, other) {
    var merged = {};
    if (hash) Hash.update(merged, hash);
    if (other) Hash.update(merged, other);
    return merged;
}

exports.update = function(hash, other) {
    for (var key in other)
        hash[key] = other[key];
    return hash;
}

exports.forEach = function(hash, block) {
    for (var key in hash)
        block(key, hash[key]);
}

exports.map = function(hash, block) {
    var result = [];
    for (var key in hash)
        result.push(block(key, hash[key]));
    return result;
}

