var standard = require("../binary-b");
Object.keys(standard).forEach(function(key) {
    exports[key] = standard[key]; 
});

exports.shim = function() {
    standard.shim();
};
