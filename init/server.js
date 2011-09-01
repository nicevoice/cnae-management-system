var http = require('http');

http.createServer(function(req, res){
      res.writeHead(200, {"content-type":"text/html"});
      res.end("hello,cnode app engine!");
      }).listen(80);
console.log("server started at port 8081");
