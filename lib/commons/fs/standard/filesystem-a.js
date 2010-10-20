// Adapted from http://github.com/kriszyp/promised-io

var fs;
try {
    fs = require("file");
}
catch (e) {
    fs = require("fs");
}
var LazyArray = require("../../stream/array").LazyArray;
var defer = require("../../promise").defer;
for(var i in fs) exports[i] = fs[i];

exports.readFileSync = fs.read;
exports.writeFileSync = fs.write;
exports.mkdirSync = fs.mkdir;
exports.readdir = exports.list;
exports.stat = exports.statSync = function(path) {
    try{
        var stat = fs.stat.apply(null, arguments);
    }catch(e){
        var deferred = defer();
        deferred.reject(e);
        return deferred.promise;
    }
    stat.isFile = function() {
        return fs.isFile(path);
    }
    if(!stat.mtime){
        var deferred = defer();
        deferred.reject("File not found");
        return deferred.promise;
    }
    return stat;
}

exports.makeTree = fs.mkdirs;
exports.makeDirectory = fs.mkdir;

exports.open = function(){
    var file = fs.open.apply(this, arguments);
    var array = LazyArray({
        some: function(callback){
            while(true){
                var buffer = file.read(4096);
                if(buffer.length <= 0){
                    return;
                }
                if(callback(buffer)){
                    return;
                }
            }
        }
    });
    for(var i in array){
        file[i] = array[i];
    }
    return file;
};
exports.openSync = exports.open;

exports.createWriteStream = function(path, options) {
    options = options || {};
    options.flags = options.flags || "w";
    var flags = options.flags || "w",
        f = fs.open(path, flags);
    return {
        writable: true,
        write: function() {
            var deferred = defer();
            try {
                f.write.apply(this, arguments);
                f.flush();
            }
            catch (e) {
                return stream.writable = false;
            }
            deferred.resolve();
            return deferred.promise;
        },
        end: f.close,
        destroy: f.close
    }
}
