var info = require("../console").info;
var assert = require("../assert");
var when = require("../promise").when;
var all = require("../promise").all;
var request = require("./client").request;
var results = [];

results.push(when(request({url: "http://google.com/"}), function(response) {
    assert.ok(response.status < 400);
}));

when(all(results), function() {
    info("http client tests completed successfully");
});

