var config = require('../config.test');
var url = require('url');
var connect = require('connect');
var md5 = require('../../src/lib/utils').hex_md5;

app = connect.createServer();
app.use(connect.bodyParser());

app.use(connect.router(function(method){
  method.get('/json', onJson);
  method.get('/string', onString);
  method.get('/wrongjson', onWrongJson);
    method.get(config.labs.path, proxy);
}));

/***
*  labs获取sessionID
**/
function proxy(req, res){
  var qs = url.parse(req.url, true).query;
  var sessionId = decodeURIComponent(qs.sessionId||'');
  var sign = decodeURIComponent(qs.sign||'');
  var checkSign = md5(config.labs.secret + sessionId + config.labs.secret).toUpperCase();
  if(sign !== checkSign){
    return res.end(JSON.stringify({
      status:"false",
      code : "4"
    }));
  }
  if(sessionId==='id001'){
    return res.end(JSON.stringify({
      status:"ok",
      code : "0",
      taobao_nick : "dead_horse"
    }));
  }
  return res.end(JSON.stringify({
    status:"false",
    code : "1"
  }));
}

/***
*  返回数据测试
**/
function onJson(req, res){
  res.end(JSON.stringify({status:'ok'}));
}
function onString(req, res){
  res.end('string');
}
function onWrongJson(req, res){
  res.end('{"status":"ok');
}
app.listen(config.labs.port);
module.exports = app;