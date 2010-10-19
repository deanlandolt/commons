if (!require.main) require.main = module;

// TODO integrate a simple cross-platform test runner (maybe patr?)
exports.test = function() {
    require("./commons/binary").test();
    //require("./commons/stream").test();
    require("./commons/fs").test();
    require("./commons/http").test();
}

if (require.main === module) {
    exports.test();
}
else {
    // TODO some kind of options object to control these shims?
    
    require("./commons/shim/es5");
    require("./commons/binary").shim();
    //require("./commonjs/stream").shim();
    //require("./commons/fs").shim();
    
    // de facto standards to improve interop
    
    // process as a global for majority -> node compat
    process = require("./commons/process");
    
    // print as a global for to node (but not browser)
    if (typeof print === "undefined") print = process.print;
    
    // console as global
    console = require("./commonjs/console");
    
    // narwhal adds RegExp.escape -- any reason to not do this?
    // TODO this should probably go in a util shim
    /*** RegExp.escape
        accepts a string; returns the string with regex metacharacters escaped.
        the returned string can safely be used within a regex to match a literal
        string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
        |, #, [comma], and whitespace.
    */
    RegExp.escape = function (str) {
        return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
    };
}