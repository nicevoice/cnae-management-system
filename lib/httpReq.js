var http = require('http');
var config = require('../config');
var request_timer = null, req = null;
// 请求5秒超时

exports.httpReq = function(options, callback){
var req = http.request(options, function(res){
console.log("got response:" + res.statusCode);

console.log("headers:" + JSON.stringify(res.headers));

res.setEncoding('utf8');
res.on('data', function(chunk){
console.log("body:" + chunk);
});
res.on('end', function() {
console.log('end');
});
res.on('error',function(err) {
console.log('res error', err);
});
}).on('error', function(e){
console.log("got error:" + e.message);
});

req.end();
}