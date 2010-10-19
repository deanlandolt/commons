if (!require.main) require.main = module;

exports.client = require("./http/client");

exports.test = function() {
    exports.client.test();
};

if (require.main === module) exports.test();