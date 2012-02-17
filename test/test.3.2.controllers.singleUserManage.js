var app = require('../src/app');
var config = require('../src/config');
var testConf = require('./config.test');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var fs = require('fs');
var cml = require('./helper/command_line');
var clone = utils.clone,
    Request = utils.Request,
    Get = utils.Get,
    Post = utils.Post,
    cookie = utils.cookie,
    tpl = utils.tpl,
    createDone = utils.createDone;

var COOKIE='';
var CSRF='';

describe('single user management test', function(){
  before(function(done){
    app.listen(1130);
    cml.dev.listen(testConf.cmdPort);
    var opt = clone(tpl);
    opt.path = '/login';
    Get(opt, function(res){
      var csrfReg = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/;
      CSRF = csrfReg.exec(res.body)[1];
      opt.headers.cookie = COOKIE = cookie(res.headers['set-cookie']);
      opt.path = '/checkLogin';
      opt.data = {
      email : 'dead_horse@qq.com',
      pwd : 'test12',
      remeber_me : true,
      _csrf : CSRF
      }
      Post(opt, function(res){
        done();
      });
    })
  })
  describe('#show(): display application page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/application';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('我的应用');
        done();
      })
    })
  })

  describe('#loadMainContent(): laod application infos', function(){
    it('should load content fine', function(done){
      var opt = clone(tpl);
      opt.path = '/application/load_apps';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var response = JSON.parse(res.body);
        response.status.should.equal('ok');
        response.content.ownApps.should.be.empty;
        response.content.otherApps.should.be.empty;
        done();
      })
    })
  })

  describe('showNewApp()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/newApp';
      Get(opt, function(res){
        res.body.should.include('创建应用');
        done();
      })      
    })
  })
  describe('#createApp()', function(){
    var opt = clone(tpl);
    opt.path = '/createApp';
    opt.data = {
      appDomain : 'TEST',
      appName : 'TEST'
    }
    it('should response domainErr', function(done){
      opt.data._csrf = CSRF;
      opt.headers.cookie = COOKIE;
      Post(opt, function(res){
        res.body.should.include('domainErr');
        done();
      })
    })
    it('should response noName', function(done){
      opt.data._csrf = CSRF;
      opt.headers.cookie = COOKIE;
      opt.data.appName= '';
      opt.data.appDomain = 'test';
      Post(opt, function(res){
        res.body.should.include('noName');
        done();
      })     
    })
    it('should response githubErr', function(done){
      opt.data.appName= 'test';
      opt.data.github = 'wlegeq';
      Post(opt, function(res){
        res.body.should.include('githubErr');
        done();
      })     
    })
    it('should response imgErr', function(done){
      opt.data.github = 'https://github.com/dead-horse/cnae-management-system';
      opt.data.appImage = 'https://github.com/dead-horse/cnae-management-system';
      Post(opt, function(res){
        res.body.should.include('imgErr');
        done();
      })
    })
    it('should response ok', function(done){
      opt.data.appImage = 'http://ww3.sinaimg.cn/large/7e03780agw1doqthkj4mwj.jpg';
      opt.data.github = '';
      Post(opt, function(res){
        res.body.should.include('ok');
        setTimeout(function(){
          var DONE = createDone(2, done);
          fs.readdirSync(config.uploadDir + '/test').should.have.length(3);
          db.count(config.dbInfo.collections.app_basic, {}, function(err, count){
            count.should.equal(1);
            DONE();
          })
          db.count(config.dbInfo.collections.app_member, {}, function(err, count){
            count.should.equal(1);
            DONE();
          })        
        }, 50);
      })      
    })
    it('should response reapeat domain', function(done){
      opt.data.appName = 'test1';
      Post(opt, function(res){
        res.body.should.include('domainRep');
        done();
      })        
    })
    it('should response num limit', function(done){
      var tplAdmins = clone(config.admins);
      config.admins = [];
      var DONE = function(i, res){
        if(i===11){
          config.admins = tplAdmins;
          res.body.should.include('domainLimit');
          done();
        }else{
          res.body.should.include('ok');
          newApp(i+1);
        }
      }
      var newApp = function(i){
        opt.data.appDomain = 'test' + i;
        opt.data.appName = 'test' + i;
        Post(opt, function(res){
          DONE(i, res);
        })           
      };
      newApp(2);
    })
  })

  describe('#checkAppDomain()', function(){
    var opt = clone(tpl);
    opt.path = '/checkAppDomain?domain=test';
    it('should response already used', function(done){
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('域名已经被使用');
        done();
      })      
    })
  })
  /***
  * appInfo.js Test
  */
  describe('#sum(): get the sum page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/application/manage/test/sum';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('汇总信息');
        res.body.should.include('dead_horse');
        done();
      })
    })
  })

  describe('#loadSumContent()', function(){
    it('should get content of sum ', function(done){
      var opt = clone(tpl);
      opt.path = '/application/manage/test/load_sum';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('ok');
        res.body.should.include('test');
        done();
      })
    })
  })

  describe('#doControlApp', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/controlApp';
    it('should app start ok', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        action : 'start',
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.body.should.include('start ok')
        done();
      })
    })
    it('should app stop ok', function(done){
      opt.data.action = 'stop';
      Post(opt, function(res){
        res.body.should.include('stop ok')        
        done();
      })      
    })
    it('should app restart ok', function(done){
      opt.data.action = 'restart';
       Post(opt, function(res){
        res.body.should.include('restart ok')        
        done();
      })       
    })
  })

  describe('#getStatus()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/getStatus';
    it('should get status ok', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        savePort:true,
        _csrf:CSRF
      }
      Post(opt, function(res){
        res.body.should.include('running');
        done();
      })
    })
  })

  /***
  *  appManager Test
  */
  describe('#getAllApps():get user apps', function(){
    it('should response user\'s all apps', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/load_allapp';
      Get(opt, function(res){
        JSON.parse(res.body).content.apps.should.have.length(10);
        done();
      })
    })
  })

  describe('#appmng():diplay app manage page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/appmng';
      Get(opt, function(res){
        res.body.should.include('应用设置');
        done();
      })    
    })
  })

  describe('#loadAppmng()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/load_appmng';
      Get(opt, function(res){
        res.body.should.include('"appDomain":"test"');
        done();
      })    
    })
  })

  describe('#doAppmng()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/appmng';
    it('should response noName', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.body.should.include('请输入应用名称');
        done();
      })
    })
    it('should response githubErr', function(done){
      opt.data.newAppName = 'testChange';
      opt.data.newGithub = 'https://githubs.com/dead-horse/cnae-management-system'
      Post(opt, function(res){
        res.body.should.include('github地址不正确');
        done();
      })
    })    
    it('should response imgErr', function(done){
      opt.data.newAppName = 'testChange';
      opt.data.newGithub = 'https://github.com/dead-horse/cnae-management-system';
      opt.data.newImgSource = 'https://github.com/dead-horse/cnae-management-system';
      Post(opt, function(res){
        res.body.should.include('图片地址不正确');
        done();
      })
    })
     it('should response ok', function(done){
      opt.data.newAppName = 'testChange';
      opt.data.newGithub = 'https://github.com/dead-horse/cnae-management-system';
      opt.data.newImgSource = '';
      Post(opt, function(res){
        res.body.should.include('"status":"ok"');
        done();
      })
    })   
  })

  describe('#coopmng():display coopmng page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/coopmng';
      Get(opt, function(res){
        res.body.should.include('成员管理');
        done();
      })
    })
  })

  describe('#loadCoopmng()', function(){
    it('should load coop content', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/load_coopmng';
      Get(opt, function(res){
        JSON.parse(res.body).content.mems.should.have.length(1);
        JSON.parse(res.body).content.own.email.should.equal('dead_horse@qq.com');
        done();
      })
    })
  })

  describe('#doCoopmng()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/coopmng';
    it('should response wrong role', function(done){
      opt.data = {
        role : 5,
        _csrf : CSRF
      }
      opt.headers.cookie = COOKIE;
      Post(opt, function(res){
        res.body.should.include('错误的角色信息');
        done();
      })
    })
    it('should response noEmail', function(done){
      opt.data.role = '1';
      Post(opt, function(res){
        res.body.should.include('请输入邮箱');
        done();
      })
    })
    it('should response emailErr', function(done){
      opt.data.inviteEmail = 'test@@gmail.com'
      Post(opt, function(res){
        res.body.should.include('请输入正确的email地址');
        done();
      })
    })    
    it('should response inviteSelf', function(done){
      opt.data.inviteEmail = 'dead_horse@qq.com'
      Post(opt, function(res){
        res.body.should.include('不能邀请自己');
        done();
      })
    })
    it('should response ok', function(done){
      opt.data.inviteEmail = 'user1@qq.com'
      Post(opt, function(res){
        res.body.should.include('"status":"ok"');
        done();
      })
    })
    it('should response already in', function(done){
      Post(opt, function(res){
        res.body.should.include('不能邀请已参加用户');
        done();
      })
    })
  })

  describe('#getEmails()', function(){
    var opt = clone(tpl);
    it('should return emails emailMatch tow short', function(done){
      opt.path = '/get/emails?emailMatch=da';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('input too short');
        done();
      })
    })
    it('should return limit emails', function(done){
      opt.path = '/get/emails?emailMatch=qq.com&limit=1';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('"status":"ok"');
        JSON.parse(res.body).emails.should.have.length(1);
        done();
      })
    })
    it('should return all match emails', function(done){
      opt.path = '/get/emails?emailMatch=qq.com';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('"status":"ok"');
        JSON.parse(res.body).emails.should.have.length(2);
        done();
      })      
    })
  })

  describe('#doChangeRole', function(req, res){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/changeRole';
    it('should response wrong role', function(done){
      opt.data = {
        role : 5,
        _csrf : CSRF
      }
      opt.headers.cookie = COOKIE;
      Post(opt, function(res){
        res.body.should.include('错误的角色信息');
        done();
      })
    })
    it('should response email err', function(done){
      opt.data.role = '1';
      opt.data.email = "test4@qq.com";
      Post(opt, function(res){
        res.body.should.include('该用户未参与此应用');
        done();
      })
    })
    it('should response ok', function(done){
       opt.data.role = '2';
      opt.data.email = "user1@qq.com";
      Post(opt, function(res){
        res.body.should.include('ok');
        done();
      })     
    })
  })

  describe('#mnglog(): show log mng page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/mnglog';
      Get(opt, function(res){
        res.body.should.include('管理记录');
        res.body.should.include('dead_horse');
        done();
      })
    })
  })
  describe('#loadMnglog()', function(){
    it('should load mnglog data', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/load_mnglog';
      Get(opt, function(res){
        res.body.should.include('"status":"ok"');
        JSON.parse(res.body).content.records.should.have.length(4);
        done();
      })
    })
  })
    /***
  *  appOptimization test
  */
  describe('#applog()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/application/manage/test/applog';
      Get(opt, function(res){
        res.body.should.include('stdout');
        res.body.should.include('dead_horse');
        done();
      })
    })    
  })

  describe('#getStdOutput()', function(){
    var opt = clone(tpl);
    opt.path = '/application/manage/test/getStdOutput';
    it('should return log', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        action : 'stdout'
      }
      Post(opt, function(res){
        JSON.parse(res.body).output.should.include('!!!!!!!!');
        JSON.parse(res.body).output.should.have.length(100);
        done();
      })
    })
    it('shoud return wrong action', function(done){
      opt.data.action = 'start';
      Post(opt, function(res){
        JSON.parse(res.body).output.should.equal('wrong action.');
        done();
      })
    })
  })

  after(function(){
    app.close();
    cml.dev.close();
  })
})