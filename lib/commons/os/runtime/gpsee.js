// Original by Kris Kowal, ripped from Perservere by Wes Garland, ported to GPSEE

exports.exit = function (status) {
  status = +status;
  if (isNaN(status))
    status = 1;
  require("gpsee").exit(status);
};

exports.sleep = function (seconds) {
  require("gpsee".sleep(seconds));
};

exports.fork = function () {
  require("gpsee").fork();
};

exports.exec = function () {
};

exports.system = function (command) {
    if (Array.isArray(command)) {
        command = command.map(function (arg) {
            return require("os").enquote(arg);
        }).join(" ");
    }

    return require("gpsee").system(command);
};

exports.dup = function () {
};

exports.dup2 = function () {
};

exports.setsid = function () {
};

exports.getpid = function () {
  return require("gpsee").pid;
};

exports.popen = function (command, options) {
  return require("shellalike").cay(command + " " + options);
};


