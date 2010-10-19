if (!require.main) require.main = module;

var process = require("./process");
var runtimeModule = require("./fs/runtime/" + process.runtime);
var fs = exports;
for (var key in runtimeModule) fs[key] = runtimeModule[key];

exports.test = function() {
    var assert = require("./assert");
    var when = require("./promise").when;
    
    when(fs.read("README.md"), function(contents) {
        assert.equal(typeof contents, "string");
        assert.equal(contents.indexOf("# The Javascript Commons"), 0);
    });
    
    // TODO expand this stub, but to do so we'll to incorporate patr
    process.print("fs client tests completed successfully")
};

if (require.main === module) exports.test();