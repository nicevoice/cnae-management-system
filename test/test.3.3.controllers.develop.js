var app = require('../src/app');
var config = require('../src/config');
var testConf = require('./config.test');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var fs = require('fs');
var cml = require('./helper/command_line');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var clone = utils.clone,
    Request = utils.Request,
    Get = utils.Get,
    Post = utils.Post,
    cookie = utils.cookie,
    tpl = utils.tpl,
    createDone = utils.createDone;

var COOKIE='';
var CSRF='';
var CSRF_curl='';
var COOKIE_curl='';

describe('user develop manage test', function(){
  before(function(done){
    var DONE = createDone(2, done);
    app.listen(1130);
    cml.listen(testConf.cmdPort);
    var opt = clone(tpl);
    opt.path = '/login';
    Get(opt, function(res){
      CSRF = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/.exec(res.body)[1];
      opt.headers.cookie = COOKIE = cookie(res.headers['set-cookie']);
      opt.path = '/checkLogin';
      opt.data = {
      email : 'dead_horse@qq.com',
      pwd : 'test12',
      remeber_me : true,
      _csrf : CSRF
      }
      Post(opt, function(res){  //login use http.request
        DONE();
      });
    })
    exec('curl -i localhost:1130/login', function(err, stdout){
      CSRF_curl = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/.exec(stdout)[1];
      COOKIE_curl = /Set-Cookie:\s?(.*?);/i.exec(stdout)[1];
      exec('curl -i --cookie '+COOKIE_curl+' --data "_csrf='+CSRF_curl+'&email=dead_horse@qq.com&pwd=test12" localhost:1130/checkLogin', function(err, stdout, stderr){
        DONE();           
      })

    })
  })

  describe('#vermng()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/application/manage/test/vermng';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('上传下载');
        res.body.should.include('Git');
        res.body.should.include('npm');
        done();
      })
    })
  })

  describe('#doUpload()', function(){
    it('should upload wrong format', function(done){
      exec('curl -i --cookie ' + COOKIE_curl + ' --form upload=@'+
        __dirname + '/temp/test.json --form _csrf=' + CSRF_curl + ' --form press=submitUpload ' +
        'http://localhost:1130/application/manage/test/upload'
      , function(err, stdout, stderr){
        stdout.should.include('文件格式不正确');
        done();
      })
    })
  })

  describe('#newTodo()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/todo/new';
    it('should new a todo', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        title : 'test',
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.should.have.status(302);
        res.headers.location.should.equal('/application/manage/test/todo');
        done();
      })
    })
  })
})