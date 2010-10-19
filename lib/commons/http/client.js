// Jacked from http://github.com/kriszyp/promised-io

if (!require.main) require.main = module;

var process = require("../process");
var runtimeModule = require("./client/runtime/" + process.runtime);
for (var key in runtimeModule) exports[key] = runtimeModule[key];

var defer = require("../promise").defer;
var when = require("../promise").when;
var log = require("../console").log;


// FIXME this way too naive
var isRedirect = exports.isRedirect = function(response){
    return [301,302,303,307].indexOf(response.status) >= 0;
}

exports.Redirect = function(nextApp, maxRedirects){
    maxRedirects = maxRedirects || 10;
    return function(request){
        var remaining = maxRedirects,
            deferred = defer();
        function next() {
            when(nextApp(request), function(response) {
                if(remaining--) {
                    // TODO cache safe redirects when cache is added
                    if(isRedirect(response)){
                        request.url = response.headers.location;
                        next();
                    }else{
                        deferred.resolve(response);
                    }
                }
                else {
                    if (isRedirect(response)) log("Maximum redirects reached");
                    deferred.resolve(response);
                }
            }, deferred.reject);
        }
        next();
        return deferred.promise;
    }
}

exports.CookieJar = function(nextApp) {
    var domainToCookies = {};
  
    return function(req) {
        var querystring = require("./querystring"),
            parseUri = require("./util/uri").parseUri;
        
        if (req.url) {
            var url = parseUri(req.url);
            req.hostname  = url.host;
            req.port = url.port;
            req.pathInfo = url.path;
            req.authority = url.authority;
        }
        
        if (req.hostname && domainToCookies[req.hostname]) {
            var cookieString = "";
            req.headers["cookie"] = querystring.toQueryString(domainToCookies[req.hostname]);
        }
        
        return when(nextApp(req), function(response) {
            var cookies;
            if (response.headers["set-cookie"]) {
                var path, domain = req.hostname + (req.port ? ":"+req.port : "");
                
                cookies = querystring.parseQuery(response.headers["set-cookie"], /[;,]/g);
                if (cookies.Version !== undefined) { delete cookies.Version; }
                if (cookies.Path !== undefined) { path = cookies.Path; delete cookies.Path; }
                if (cookies.HttpOnly !== undefined) { delete cookies.HttpOnly; }
                if (cookies.Domain !== undefined) { domain = cookies.Domain; delete cookies.Domain; }
                
                for (var k in cookies) {
                    if (Array.isArray(cookies[k])) {
                        cookies[k] = cookies[k][0];
                    }
                }
                
                if (cookies) {
                    domainToCookies[req.hostname] = cookies;
                }
            }
            
            return response;
        });
    };
};

// TODO exports.Cache

// TODO exports.CookieJar

/**
* HTTP Client using the JSGI standard objects
*/
exports.Client = function(options) {
    if (!(this instanceof exports.Client)) return new exports.Client(options);
    options = options || {};
    for (var key in options) {
        this[key] = options[key];
    }
    this.request = exports.request;
    // turn on redirects by default
    var redirects = "redirects" in this ? this.redirects : 20;
    if (redirects) {
        this.request = exports.CookieJar(exports.Redirect(this.request, typeof redirects === "number" && redirects));
    }
    
    var finalRequest = this.request;
    this.request = function(options) {
        if (typeof options === "string") options = {url: options};
        return finalRequest(options);
    }
};

exports.test = function() {
    var assert = require("../assert");
    var when = require("../promise").when;
    var request = exports.request;
    
    when(request({url: "http://google.com/"}), function(response) {
        assert.equal(response.status, 200);
    });
    
    // TODO expand this stub, but to do so we'll to incorporate patr
    process.print("http client tests completed successfully")
};

if (require.main === module) exports.test();