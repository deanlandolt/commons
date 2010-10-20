var standard = require("../standard/filesystem-a");
Object.keys(standard).forEach(function(key) {
    exports[key] = standard[key]; 
});
