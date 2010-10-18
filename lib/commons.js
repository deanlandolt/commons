if (!require.main) require.main = module;

// TODO narwhal adds RegExp.escape -- it's nice...should we do this as well:
/*** RegExp.escape
    accepts a string; returns the string with regex metacharacters escaped.
    the returned string can safely be used within a regex to match a literal
    string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
    |, #, [comma], and whitespace.
*/
//RegExp.escape = function (str) {
//    return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
//};


// TODO integrate a simple cross-platform test runner (maybe patr?)
exports.test = function() {
    require("./commons/binary").test();
}

if (require.main === module) {
    exports.test();
}
else {
    require("./commons/es5");
    require("./commons/binary").shim();
}