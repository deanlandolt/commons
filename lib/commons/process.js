
var system = exports.system = {};
try {
    system = require("" + "system"); // intentially bypass static analysis
} catch (e) {}


/**
 * Runtime detection tests for all supported platforms.
 * Tests are ordered by (perceived) specificity but this could use more eyes.
 */
exports.detectRuntime = function() {
    if (typeof system.platform === "string") {
        if (system.platform.indexOf("flusspferd") >= 0) return "flusspferd";
        if (system.platform.indexOf("gpsee") >= 0) return "gpsee";
    }
    if (typeof process !== "undefined" && process && process.versions && process.versions.node)
        return "node";
    //if (typeof environment === "object" && "ringo.home" in environment)
    //    return "ringo"
    try {
        if (require("ringo/shell").read)
            return "ringo"
    } catch (e) {}
    if (system.engines && system.setOptimizationLevel)
        return "narwhal"; // not good enough, what else can we use?
    if (typeof navigator !== "undefined")
        return "browser";
    return "default"; // unknown
};


if (typeof print === "function") exports.print = print;

exports.runtime = exports.detectRuntime();
if (exports.runtime === "browser") {
    exports.print = function() {
        // TODO console module?
        console.log.apply(console, arguments);
    }
}

if (exports.runtime === "node") {
    exports.args = process.argv;
    exports.env = process.env;
    
    var nodeUtil;
    try {
        nodeUtil = require("" + "util");
    }
    catch (e) {
        // for 0.2.x compat
        nodeUtil = require("" + "sys");
    }
    exports.print = function() {
        var buffer = [];
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            if (arg) buffer.push(arg);
        }
        nodeUtil.puts(buffer.join(" "));
    }
    exports.dir = function() {
        for(var i = 0, len = arguments.length; i < len; i++)
            nodeUtil.debug(nodeUtil.inspect(arguments[i]));
    }
}

if (["narwhal", "gpsee", "ringo", "flusspferd"].indexOf(exports.runtime) >= 0) {
    exports.args = system.args;
    exports.env = system.env;
}
