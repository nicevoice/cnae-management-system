var app = require('../src/app');
var config = require('../src/config');
var testConf = require('./config.test');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var path = require('path');
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
var downLoadZip = '';
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
      curlTpl = tplReplace(curlTpl, {
        '$$COOKIE$$' : COOKIE,
        '$$CSRF$$' : CSRF,
        '$$PATH$$' : '$$PATH$$'
      });
      exec(tplReplace(curlTpl, {'$$PATH$$' : __dirname+'/temp/test.json' 
          }), function(err, stdout, stderr){
        stdout.should.include('解压缩失败，请确认上传文件是否正确');
        done();
      })
    })
    it('should upload OK with zip', function(done){
      exec(tplReplace(curlTpl, {'$$PATH$$' : __dirname+'/temp/test.zip' 
          }), function(err, stdout, stderr){
          stdout.should.include('/application/manage/test/sum');
          var files = fs.readdirSync(__dirname+'/temp/apps/test/');
          files.should.have.length(4);
          files.should.include('zip.js');
          done();
      })
    })
    it('should upload OK with dir zip', function(done){
      exec(tplReplace(curlTpl, {'$$PATH$$' : __dirname+'/temp/dir.zip' 
          }), function(err, stdout, stderr){
          stdout.should.include('/application/manage/test/sum');
          var files = fs.readdirSync(__dirname+'/temp/apps/test/');
          files.should.have.length(5);
          files.should.include('dir.js');
          done();
      })
    })
  })

  describe('#gitAction()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/git';
    it('should not a git action', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        gitCommand : 'git status && cd ..',
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.body.should.include('不是有效的git操作');
        done();
      })
    })
    it('should forbidden', function(done){
      opt.data.gitCommand = 'git config'
      Post(opt, function(res){
        res.body.should.include('该操作不被允许');
        done();
      })
    })
  })

  describe('#doDownload()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/download';
    it('should response error file name', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        files : '*html.js&&cd ..',
        _csrf : CSRF
      }
       Post(opt, function(res){
        res.body.should.include('error');
        res.body.should.include('错误的文件名或通配符');
        done();
      })     
    })
    it('should zip none', function(done){
      opt.data.files = '*.html';
       Post(opt, function(res){
        res.body.should.include('error');
        res.body.should.include('没有找到匹配的文件');
        done();
      })     
    })
    it('should zip fine', function(done){
      opt.data.files = '*.js';
      Post(opt, function(res){
        res.body.should.include('ok');
        res.body.should.include('/download/test');
        downLoadZip = /\/download\/(.*?\.zip)/.exec(res.body)[1];
        var files = fs.readdirSync(path.dirname(__dirname)+'/src/download/');
        files.should.have.length(1);
        files[0].should.include('test_');
        done();
      })
    })
  })

  describe('#downloading()', function(){
    var opt = clone(tpl);
    it('should get wrong page', function(){
      opt.path = '/download/test_1248923.zip';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('你输入的网址可能不正确');
        res.should.have.status(404);
      })
    })
    it('should get forbidden', function(){
      opt.path = '/download/testt_1248923.zip';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('没有权限');
      })    
    })
    it('should get zip', function(done){
       opt.path = '/download/'+downLoadZip;
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.headers['content-type'].should.equal('application/zip');
        done();
      })        
    })
  })

  describe('#showMongo()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/application/manage/test/mongo';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('mongoDB');
        done();
      })
    })
  })

  describe('#loadMongoContent()&&#createMongo()', function(){
    var optLoad = clone(tpl);
    var optCreate = clone(tpl);
    optCreate.path = '/application/manage/test/createMongo';
    it('should load the content of mongo', function(done){
      optLoad.path = '/application/manage/test/load_mongo';
      optLoad.headers.cookie = COOKIE;
      Get(optLoad, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.content.dbUserName.should.have.length(12);
        result.content.dbPassword.should.have.length(10);
        result.content.should.not.have.property('dbType');
        done();
      })
    })
    it('should create mongodb fine', function(done){
      optCreate.headers.cookie = COOKIE;
      optCreate.data = {
        _csrf : CSRF
      }
      Post(optCreate, function(res){
        res.body.should.include('/application/manage/test/mongo');
        res.should.have.status(302);
        done();
      })
    })
    it('should create mongodb repeat error', function(done){
      Post(optCreate, function(res){
        res.body.should.include('已创建数据库');
        done();
      })
    })
    it('should load mongodb fine', function(done){
      Get(optLoad, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.content.dbUserName.should.have.length(12);
        result.content.dbPassword.should.have.length(10);
        result.content.dbType.should.equal('mongo');
        done();
      })
    })
  })

  describe('#queryMongo()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/queryMongo';
    it('should response forbidden', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
      }
      var args = ['dba.find()', 'db.addUser("a")', 'db.auth("123")', 'db.removeUser()',
      'db.dropDatabase', 'db.shoutdownServer()', 'db.copyDatabase', 'db.cloneDatabse'];
      var len = args.length;
      var DONE = createDone(len, done);
      for(var i=0; i!=len; ++i){
        opt.data.queryString = args[i];
        Post(opt, function(res){
          res.body.should.include('该操作不被允许');
          DONE();
        })
      }
    })
    it('should response find', function(done){
      opt.data.queryString = 'show collections';
      Post(opt, function(res){
        JSON.parse(res.body).status.should.equal('ok');
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