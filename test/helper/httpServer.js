var http = require('http'), url = require('url');
      http.createServer(function(req, res) {
        var path = url.parse(req.url).pathname;
        console.log(path);
        if(path === "/unit_test") {
          var test = url.parse(req.url, true).query.test;
          body = new Buffer(JSON.stringify({
            status : "ok",
            query : test
          }));
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