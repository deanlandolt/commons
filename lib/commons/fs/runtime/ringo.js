var standard = require("../filesystem-a");
Object.keys(standard).forEach(function(key) {
    exports[key] = standard[key]; 
});
