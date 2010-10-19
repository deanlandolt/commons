if (!require.main) require.main = module;

var process = require("./process");
var runtimeModule = require("./os/runtime/" + process.runtime);

if (require.main === module) require("./os-tests");