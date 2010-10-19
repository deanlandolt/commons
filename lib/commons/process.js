// Adapted from http://github.com/kriszyp/promised-io

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
    // TODO exports.engine?
    exports.print = console.log;
}

if (exports.runtime === "node") {
    exports.engine = "v8";
    // copy everything from the process global
    for (var key in process) exports[key] = process[key];
    exports.print = console.log;
}

if (exports.runtime === "narwhal") {
    exports.engine = system.engine;
}

if (exports.runtime === "ringo") {
    exports.engine = "rhino";
}

if (exports.runtime === "gpsee" || exports.runtime === "flusspferd") {
    exports.engine = "spidermonkey"; // FIXME tracemonkey?
}

if (["narwhal", "gpsee", "ringo", "flusspferd"].indexOf(exports.runtime) >= 0) {
    exports.args = system.args;
    exports.env = system.env;
}
