// Adapted from http://github.com/kriszyp/commonjs-utils

var readSync = require("../fs").readSync;
try {
    var settings = JSON.parse(readSync("local.json").toString("utf8"));
    for (var key in settings){
        exports[key] = settings[key];
    }
}
catch (e) {
    e.message += " trying to load local.json, make sure local.json is in your current working directory";
    throw e;
}