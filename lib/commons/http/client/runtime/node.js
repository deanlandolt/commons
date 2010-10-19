// Jacked from http://github.com/kriszyp/promised-io

/**
* HTTP Client using the JSGI standard objects
*/
var defer = require("../../../promise").defer,
	when = require("../../../promise").when,
	LazyArray = require("../../../stream/array").LazyArray,
	http = require("http"),
	parse = require("url").parse;

// configurable proxy server setting, defaults to http_proxy env var
exports.proxyServer = require("../../../process").env.http_proxy;

exports.request = function(originalRequest){
	// make a shallow copy of original request object
	var request = {};
	for(var key in originalRequest){
		if(originalRequest.hasOwnProperty(key)){
			request[key] = originalRequest[key];
		}
	}
	
	if(request.url){
		var parsed = parse(request.url);
		if (parsed.pathname) {
			parsed.pathInfo = parsed.pathname;
		} else {
			parsed.pathInfo = "/";
		}
		request.queryString = parsed.query || "";
		for(var i in parsed){
			request[i] = parsed[i];
		}
	}
	var deferred = defer();
	if(exports.proxyServer){
		request.pathname = request.url;
		var proxySettings = parse(exports.proxyServer);
		request.port = proxySettings.port; 
		request.host = proxySettings.hostname;
	}
	
	var client = http.createClient(request.port || 80, request.hostname);

	var requestPath = request.pathInfo || "";
	if (request.queryString) {
	  requestPath += "?"+request.queryString;
	}

	var req = client.request(request.method || "GET", requestPath, request.headers || {host: request.hostname});
	var timedOut;
	req.addListener("response", function (response){
		if(timedOut){
			return;
		}
		response.status = response.statusCode;
		var sendData = function(block){
			buffer.push(block);
		};
		var buffer = [];
		var bodyDeferred = defer();
		var body = response.body = LazyArray({
			some: function(callback){
				buffer.forEach(callback);
				sendData = callback;
				return bodyDeferred.promise;
			}
		});
		if(request.encoding){
			response.setEncoding(request.encoding);
		}

		response.addListener("data", function (chunk) {
			sendData(chunk);
		});
		response.addListener("end", function(){
			bodyDeferred.resolve();
		});
		response.addListener("error", function(error){
			bodyDeferred.reject(error);
		});
		deferred.resolve(response);
		clearTimeout(timeout);
	});
	var timeout = setTimeout(function(){
		timedOut = true;
		deferred.reject(new Error("Timeout"));
	}, 20000);
	req.addListener("error", function(error){
		deferred.reject(error);
	});
	req.addListener("timeout", function(error){
		deferred.reject(error);
	});
	req.addListener("close", function(error){
		deferred.reject(error);
	});
	if(request.body){
		return when(request.body.forEach(function(block){
			req.write(block);
		}), function(){
			req.end();
			return deferred.promise;
		});
	}
	req.end();
	return deferred.promise;
};
