var osModule = require("os");
for (var key in osModule) exports[key] = osModule[key];