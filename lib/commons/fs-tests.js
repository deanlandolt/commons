var info = require("./console").info;
var assert = require("./assert");
var when = require("./promise").when;
var all = require("./promise").all;
var fs = require("./fs");
var results = [];

results.push(when(fs.read("README.md"), function(contents) {
    assert.equal(typeof contents, "string");
    assert.equal(contents.indexOf("# The Javascript Commons"), 0);
}));

when(all(results), function() {
    info("fs client tests completed successfully");
});
