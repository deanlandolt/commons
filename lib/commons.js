if (require.main && require.main !== module) {
    // SHIM
    
    require("./commons/shim/es5");
    // TODO require("./commons/binary-shim");
    require("./commons/binary").shim();
    //require("./commonjs/stream-shim").shim();
    //require("./commons/fs-shim");
    
    // de facto standards to improve interop
    // TODO these should probably go in shim
    
    // process as a global for majority -> node compat
    process = require("./commons/promise");
    
    // print as a global for to node (but not browser)
    if (typeof print === "undefined") print = process.print;
    
    // console as global
    console = require("./commonjs/console");
    
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
else {
    // TEST
    
    require("./commons/binary-tests");
    //require("./commons/stream-tests");
    require("./commons/fs-tests");
    require("./commons/http-tests");
    //require("./commons/os-tests");
}