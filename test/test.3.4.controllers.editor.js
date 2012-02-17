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
describe('editor test', function(){
  before(function(done){
    app.listen(1130);
    cml.dev.listen(testConf.cmdPort);
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

    describe('#index():editor page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/editor/test2';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('重启');
        res.body.should.include('外观');
        res.body.should.include('保存');
        done();
      })
    })
  })

  describe('#listfile()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/filelist';
    it('should read dir right', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        dirPath : ''
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.content.should.have.length(3);
        done();
      })
    })
    it('should response forbidden', function(done){
      opt.data.dirPath = '../';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })
    })
    it('should response failed', function(done){
      opt.data.dirPath = 'test';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to read dir');
        done();
      })
    })
  })

  describe('#readfile()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/readfile';
    it('should get content fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        filePath : 'package.json'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.content.should.include('"main":"./server.js"');
        done();
      })
    })
     it('should response forbidden', function(done){
      opt.data.filePath = '../test3/package.json';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })
    })
    it('should response failed', function(done){
      opt.data.filePath = 'package.js';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to read file');
        done();
      })
    })   
  })

  describe('#writefile()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/writefile';
    it('should write file fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        filePath : 'config.js',
        content : 'just for test'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('succeed');
        result.filePath.should.include('config.js');
        fs.readFileSync(result.filePath, 'utf8').should.equal(opt.data.content);
        done();
      })
    })
     it('should response forbidden', function(done){
      opt.data.filePath = '../test3/config.js';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })
    })
    it('should response failed', function(done){
      opt.data.filePath=undefined;
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to write file');
        done();
      })
    })   
  })

  describe('#renamefile()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/renamefile';
    it('should rename file fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        oriPath : 'config.js',
        newPath : 'config.js.back'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        console.log(result);
        result.status.should.equal('succeed');
        path.existsSync(result.filePath).should.be.ok;
        done();
      })
    })
     it('should response forbidden', function(done){
      opt.data.oriPath = '../test3/config.js';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })
    })
    it('should response faild by error target', function(done){
      opt.data.oriPath='test.js';
      opt.data.newPath = 'test/js.back';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to rename file');
        done();
      })     
    })
    it('should response failed by not exist', function(done){
      opt.data.oriPath='test.js';
      opt.data.newPath = 'test.js.back';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to rename file');
        done();
      })
    })
    it('should response conflict', function(done){
      opt.data.oriPath = 'config.js.back';
      opt.data.newPath = 'server.js';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('rename conflict');
        done();
      })
    })
    it('should response the same path fine', function(done){
      opt.data.oriPath = 'config.js.back';
      opt.data.newPath = '/test/../config.js.back';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('succeed');
        done();
      })
    })   
  })

  describe('#delfile()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/delfile';
    it('should delete file fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        filePath : 'config.js.back'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('succeed');
        path.existsSync(__dirname+'/temp/apps/test2/config.js.back').should.not.be.ok;
        done();
      })
    })
    it('should response failed by not exsit', function(done){
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to remove file');
        done();
      })
    }) 
     it('should response forbidden', function(done){
      opt.data.filePath = '../test3/config.js';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })
    })  
  })

  describe('#mkdir()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/mkdir';
    it('should mkdir fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        dirPath : 'dir'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('succeed');
        done();
      })
    })
    it('should response forbidden', function(done){
      opt.data.dirPath = '../test3/dir';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })     
    })
    it('should rseponse fail by exist', function(done){
      opt.data.dirPath = 'dir';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('failed to make dir');
        done();
      }) 
    })
  })

  describe('#deldir()', function(){
    var opt = clone(tpl);
    opt.path = '/editor/test2/deldir';
    it('should deldir fine', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        dirPath : 'dir'
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('succeed');
        done();
      })
    })
    it('should response forbidden', function(done){
      opt.data.dirPath = '../test3/dir';
      Post(opt, function(res){
        var result = JSON.parse(res.body); 
        result.status.should.equal('error');
        result.content.should.equal('permission denied');
        done();
      })     
    })
  })
  
  describe('#querytool()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/editor/test2/querytool';
      Get(opt, function(res){
        res.body.should.include('默认填充为最近一次请求的数据');
        res.body.should.include('URL');
        done();
      })
    })
  })

  after(function(){
    app.close();
    cml.dev.close();
  })
})