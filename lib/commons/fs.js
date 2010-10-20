var process = require("./process");
var runtimeModule = require("./fs/runtime/" + process.runtime);
var fs = exports;
for (var key in runtimeModule) fs[key] = runtimeModule[key];