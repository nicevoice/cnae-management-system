var http = require('http'),
 url = require('url'), 
 httpReq = require('../../src/lib/httpReq').httpReq, 
 testCase = require('nodeunit').testCase;

var optionsQuery = {
  "host" : "127.0.0.1",
  "path" : "/unit_test?test=unitTest",
  "port" : 2014
}
var optionsNoQuery = {
  "host" : "127.0.0.1",
  "path" : "/unit_test",
  "port" : 2014
}
var optionsReturnNotJson = {
  "host" : "127.0.0.1",
  "path" : "/",
  "port" : 2014
}
var optionsNotConnect = {
  "host" : "127.0.0.1",
  "path" : "/",
  "port" : 2015
}
http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname;
  console.log(path);
  if(path === "/unit_test") {
    var test = url.parse(req.url, true).query.test;
    if(test) {
      body = new Buffer(JSON.stringify({
        status : "ok",
        query : test
      }));
    } else {
      body = new Buffer(JSON.stringify({
        status : "error",
        msg : "no query test"
      }));
    }
    res.writeHead(200, {
      "Content/type" : "text/json",
      "Content/length" : body.length
    });
    res.end(body);
  } else {
    res.writeHead(404, {
      "Content/type" : "text/html"
    });
    res.end("404 not found");
  }
}).listen(2014);
module.exports = testCase({
  setUp : function(callback) {
    //callback();
    setTimeout(function() {callback()
    }, 10);
  },
  tearDown : function(callback) {
    callback();
  },
  test_good_path_with_query : function(test) {
    httpReq(optionsQuery, function(data) {
      test.deepEqual(data, {
        status : "ok",
        query : "unitTest"
      }, "http req with query error");
      test.done();
    });
  },
  test_good_path_without_query : function(test) {
    httpReq(optionsNoQuery, function(data) {
      test.deepEqual(data, {
        status : "error",
        msg : "no query test"
      }, "http req without query error");
      test.done();
    })
  },
  test_http_return_not_json : function(test) {
    httpReq(optionsReturnNotJson, function(data) {
      test.deepEqual(data, "http returns not json", "when http return not json error");
      test.done();
    })
  },
  test_http_not_connect : function(test) {
    httpReq(optionsNotConnect, function(data) {
      test.deepEqual(data, "ECONNREFUSED, Connection refused", "when http return not json error");
      test.done();
    })
  }
})