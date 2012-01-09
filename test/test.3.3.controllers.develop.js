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

function tplReplace(tpl, params){
    return tpl.replace(/\$\$.*?\$\$/g, function(data){
        return params[data];
    });
}

describe('user develop manage test', function(){
  before(function(done){
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
        done();
      });
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
    var curlTpl = 'curl -i --user-agent "" --cookie $$COOKIE$$ --form upload=@'+
        '$$PATH$$ --form _csrf=$$CSRF$$ --form press=submitUpload ' +
        'http://localhost:1130/application/manage/test/upload';
    it('should upload wrong format', function(done){
      exec(tplReplace(curlTpl, {
            '$$COOKIE$$': COOKIE,
            '$$CSRF$$' : CSRF,
            '$$PATH$$' : __dirname+'/temp/test.json' 
          }), function(err, stdout, stderr){
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