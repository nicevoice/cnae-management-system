var http = require('http');
var clone = exports.clone = function(obj){
    var objClone;
    if (obj.constructor == Object){
        objClone = new obj.constructor();
    }else{
        objClone = [];
    }
    for(var key in obj){
        if ( objClone[key] != obj[key] ){
            if ( typeof(obj[key]) == 'object' ){
                objClone[key] = clone(obj[key]);
            }else{
                objClone[key] = obj[key];
            }
        }
    }
    return objClone;
}
var Request = exports.Request = function(options, cb){
  var req = http.request(options, function(res){
    var body=[];
    res.on('data', function(data){
      body.push(data);
    })
    res.on('end', function(data){
      body.push(data);
      res.body = body.join('').toString();
      cb(res);
    })    
  })
  if (options.method.toUpperCase()==='POST'&&options.data) {
    req.write(JSON.stringify(options.data));
  }
  req.end();
}

exports.Get = function(options, cb){
  options.method = 'get';
  Request(options, cb);
}
exports.Post = function(options, cb){
  options.method = 'post';
  Request(options, cb);
}

exports.cookie = function(cookies){
  var str = '';
  for(var i=0, len=cookies.length; i!=len; ++i){
    str += cookies[i].split(';')[0] + ';';
  }
  return str.slice(0, str.length-1);
}

exports.tpl = {
  host:"127.0.0.1",
  port:"1130",
  headers:{
    cookie:'',
    "content-type":'application/json'
  }
}

exports.createDone = function(times, done){
  return function(){
    if(--times===0){
      done();
    }
  }
}