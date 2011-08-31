var http = require('http');
var config = require('../config');
var request_timer = null, req = null;
// 请求5秒超时

exports.httpReq = function(options, callback){
	console.log(options);
	request_timer = setTimeout(function() {
    req.abort();
    console.log('Request Timeout.');
	}, 5000);
	req = http.get(options, function(res) {
    clearTimeout(request_timer);

    // 等待响应60秒超时
    var response_timer = setTimeout(function() {
        res.destroy();
        callback({done:false, warn:"响应超时"});
    }, 60000);

    console.log("Got response: " + res.statusCode);
    var chunks = [], length = 0;
    res.on('data', function(chunk) {
        length += chunk.length;
        chunks.push(chunk);
    });
    res.on('end', function() {
        clearTimeout(response_timer);
        var data = new Buffer(length);
        // 延后copy
        for(var i=0, pos=0, size=chunks.length; i<size; i++) {
            chunks[i].copy(data, pos);
            pos += chunks[i].length;
        }
        console.log('Body:\r\n');
        console.log(data);
        callback();
    });
}).on('error', function(e) {
    // 响应头有错误
    clearTimeout(request_timer);
    console.log("Got error: " + e.message);
    callback(e.message);
});
}