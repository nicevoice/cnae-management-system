var http = require('http'),
	  log = require('../config').logWithFile;

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
    var chunks = [];
    res.on('data', function(chunk) {
        chunks.push(chunk);
    });
 res.on('end', function() {
        clearTimeout(response_timer);
        var data = "";
        // 延后copy
        for(var i=0, size=chunks.length; i<size; i++) {
			data += chunks[i];
        }
        try{
        data = JSON.parse(data);
        }catch(e){
          return callback("http returns not json");
        }
        callback(data);
    });
}).on('error', function(e) {
    // 响应头有错误
    clearTimeout(request_timer);
    console.log("Got error: " + e.message);
    callback(e.message);
});
}