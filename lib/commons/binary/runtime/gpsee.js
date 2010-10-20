var standard = require("../standard/binary-b");
Object.keys(standard).forEach(function(key) {
    exports[key] = standard[key]; 
});

exports.shim = function() {
    standard.shim();

    var binaryModule = require("binary");
    var ByteArray = binaryModule.ByteArray;
    var ByteString = binaryModule.ByteString;
    
    // override original slice to add required args
    var originalByteArraySlice = ByteArray.prototype.slice;
    ByteArray.prototype.slice = function(start, end) {
        start = start || 0;
        end = end || this.length;
        if (typeof start !== "number")
            throw new Error("Start must exist for now");
        return originalByteArraySlice.call(Object(this), start, end);
    };
    
    var originalByteStringSlice = ByteArray.prototype.slice;
    ByteString.prototype.slice = function(start, end) {
        start = start || 0;
        end = end || this.length;
        if (typeof start !== "number")
            throw new Error("Start must exist for now");
        return originalByteStringSlice.call(Object(this), start, end);
    };

};


