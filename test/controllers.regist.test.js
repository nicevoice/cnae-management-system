var app = require('../src/app');
var http = require('http');
var Request = http.request;
var config = require('../src/config');
var db = require('../src/models/index');
var tpl = {
  host:"127.0.0.1",
  port:"1130",
  headers:{
    cookie:'',
    "content-type":'application/json'
  },
  data : {
      newEmail : 'wrong!@@gmail.com',
      newUserName : 'wrong!name',
      newPassword : 'wrong',
      passwordCon : 'wrong',
      code : ''
  }
}
var CSRF = '';
var COOKIE = '';
var clone = function(obj){
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
var Request = function(options, cb){
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

var Get = function(options, cb){
  options.method = 'get';
  Request(options, cb);
}
var Post = function(options, cb){
  options.method = 'post';
  Request(options, cb);
}

var clearDb = function(){
  db.users.drop();
  db.app_mem.drop();
  db.app_basic.drop();
  db.records.drop();
}


describe('regist controller test', function(){
  before(function(){
   app.listen(1130); 
   clearDb();
  })
  describe('#404(): get 404', function(){
    it('shoud response 404 page', function(done){
      var opt = clone(tpl);
      opt.path = "/wrong/path";
      Get(opt, function(res){
        res.body.should.include('网页不存在');
        done();
      })
    })
  })

  describe('#regist():show regist page', function(){
    it('should response the regist page', function(done){
      var opt = clone(tpl);
      opt.path = '/regist';
      Get(opt, function(res){
        res.should.have.status(200);
        res.body.should.include('填写注册信息');
        //set cookie
        COOKIE = res.headers['set-cookie'];
        //set csrf
        CSRF = /<input type="hidden" value="(\w+)" id="_csrf">/.exec(res.body)[1];
        done();
      })
    })
  })

  describe('#checkRegist():handle regist req', function(){
    var opt = clone(tpl);
    opt.path = '/checkRegist';
    it('should response emailErr', function(done){
      opt.data._csrf = CSRF;
      opt.headers.cookie += COOKIE;
      Post(opt, function(res){
        res.body.should.include('emailErr');
        done();
      })
    })
    it('should response nickErr', function(done){
      opt.data.newEmail = "test@gmail.com";
      Post(opt, function(res){
        res.body.should.include('nickErr');
        done();
      })
    })
    it('should response noNick', function(done){
      opt.data.newUserName = '';
      Post(opt, function(res){
        res.body.should.include('noNick');
        done();
      })
    })
    it('should response passErr', function(done){
      opt.data.newUserName = 'dead_horse';
      Post(opt, function(res){
        res.body.should.include('passErr');
        done();
      })
    })
    it('should response diffPass', function(done){
      opt.data.newPassword = 'unittest';
      Post(opt, function(res){
        res.body.should.include('diffPass');
        done();
      })
    })
    it('should response codeErr', function(done){
      opt.data.passwordCon = 'unittest';
      Post(opt, function(res){
        res.body.should.include('codeErr');
        done();
      })
    })
    it('should response regist done', function(done){
      opt.data.newEmail = 'dead_horse@qq.com';
      Post(opt, function(res){
        console.log(res.body);
        res.body.should.include('target');
        done();
      })
    })
    it('should response nickName used', function(done){
      Post(opt, function(res){
        console.log(res.body);
        res.body.should.include('nickUsed');
        done();
      })      
    })
    it('should response email used', function(done){
      opt.data.newUserName = 'test123';
      Post(opt, function(res){
        console.log(res.body);
        res.body.should.include('emailUsed');
        done();
      })      
    })
  })

  after(function(){
    app.close();
  })
})