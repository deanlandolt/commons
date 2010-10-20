var standard = require("../standard/binary-b");
Object.keys(standard).forEach(function(key) {
    exports[key] = standard[key]; 
});

exports.shim = function() {
    standard.shim();
};
