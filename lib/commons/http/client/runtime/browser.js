exports.request = function(request) {
    var scheme = request.scheme || "http";
    var serverName = request.serverName || request.hostname || "localhost";
    var serverPort = request.serverPort || request.port || 80;
    var xhr = new XMLHttpRequest();
    
    xhr.open(request.method || "GET", 
        request.url || // allow request.url to shortcut creating a URL from all the various parts 
        (scheme + "://" + serverName + ":" + serverPort + request.pathInfo + (request.queryString ? '?' + request.queryString : '')), true);
    for(var i in request.headers) {
        xhr.setRequestHeader(i, request.headers[i]);
    }
    var deferred = defer();
    var response;
    var lastUpdate;
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 || xhr.readyState == 3) {
            if(!response){
                response = {
                    body: [xhr.responseText],
                    status: xhr.status,
                    headers: {}
                };
                lastUpdate = xhr.responseText.length;
                var headers = xhr.getAllResponseHeaders();
                headers = headers.split(/\n/);
                for(var i = 0; i < headers.length; i++){
                    var nameValue = headers[i].split(": ", 2);
                    if(nameValue){
                        var name = nameValue[0];
                        response.headers[name.toLowerCase()] = xhr.getResponseHeader(name);
                    }
                }
            }
            else{
                response.body = [xhr.responseText];
                lastUpdate = xhr.responseText.length;
            }
            if(xhr.readyState == 4){
                deferred.resolve(response);
            }
            else{
                deferred.progress(response);
            }
        }
    }
    xhr.send(request.body && request.body.toString());
    return deferred.promise;
}