var app = require('../src/app');
var config = require('../src/config');
var testConf = require('./config.test');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var clone = utils.clone,
    Request = utils.Request,
    Get = utils.Get,
    Post = utils.Post,
    cookie = utils.cookie,
    tpl = utils.tpl;

var COOKIE='';
var CSRF='';
var code = '';//store inviteCode
describe('userCenter test', function(){
  before(function(done){
    app.listen(1130);
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

  describe('#show()', function(){
    it('should redirect to userInfo', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/userCenter';
      Get(opt, function(res){
        res.should.have.status(302);
        res.body.should.include('/userCenter/userInfo');
        done();
      })
    })
  })

  describe('#userInfo()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/userCenter/userInfo';
      Get(opt, function(res){
        res.body.should.include('dead_horse@qq.com');
        res.body.should.include('昵称');
        res.body.should.include('邮箱');
        res.body.should.include('姓名');
        res.body.should.include('手机');
        res.body.should.include('主页');
        res.body.should.include('DB帐号');
        res.body.should.include('DB密码');
        done();
      })
    })
  })

  describe('#github()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.headers.cookie = COOKIE;
      opt.path = '/userCenter/github';
      Get(opt, function(res){
        res.body.should.include('设置github帐号');
        res.body.should.include('确定');
        done();
      })      
    })
  })

  describe('#setGithubInfo()', function(){
    var opt = clone(tpl);
    opt.path = '/userCenter/github/info_post';
    it('should set info right', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        githubEmail : 'dead_horse@qq.com'
      }
      Post(opt, function(res){
        JSON.parse(res.body).status.should.equal('ok');
        done();
      })
    })
    it('should response repeat error', function(done){
      Post(opt, function(res){
        JSON.parse(res.body).msg.should.equal('已绑定此github邮箱');
        done();
      })     
    })
  })

  describe('#githubInfo()', function(){
    it('should get info ok', function(done){
      var opt = clone(tpl);
      opt.path = '/userCenter/github/info';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.content.email.should.equal('dead_horse@qq.com');
        result.content.pubKey.should.include('dead_horse@qq.com');
        done();
      })
    })
  })

  describe('#changeInfo()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/userCenter/changeInfo';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('昵 称');
        res.body.should.include('dead_horse');
        res.body.should.include('姓 名');
        res.body.should.include('手 机');
        res.body.should.include('主 页');
        done();
      })
    })
  })

  describe('#changePassword()', function(){
     it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/userCenter/changePassword';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('原始密码');
        res.body.should.include('修改密码');
        res.body.should.include('确认密码');
        done();
      })
    })   
  })

  describe('#doChangeInfo', function(){
    var opt = clone(tpl);
    opt.path = '/userCenter/changeInfo';
    it('should response nameError', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF,
        changeNickName: ''
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('请输入正确的昵称');
        done();
      })
    })
    it('should response pageError', function(done){
      opt.data.changeNickName = 'dead_horse';
      opt.data.changeMainPage = 'sdhtksdlcocc';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('请输入正确的个人主页');
        done();
      })
    })
    it('should response number error', function(done){
      opt.data.changeMainPage = '';
      opt.data.changeTelNumber = '1239912228';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('请输入正确的手机号码');
        done();
      })
    })
    it('should response nickname repeat', function(done){
      opt.data.changeTelNumber = '';
      opt.data.changeNickName = 'user1';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('昵称已存在');
        done();
      })
    })

    it('should response ok', function(done){
      opt.data.changeNickName = 'dead_horse';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(true);
        done();
      })
    })
  })

  describe('#doChagnePassword()', function(){
    var opt = clone(tpl);
    opt.path = '/userCenter/changePassword';
    it('should response passError', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf : CSRF
      };
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('密码不能少于6位');
        done();
      })
    })
    it('should response passDiff', function(done){
      opt.data.changePassword = 'test12';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('两次密码必须一致');
        done();
      })
    })
    it('should response oldpassErr', function(done){
      opt.data.changeConfirmation = 'test12';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(false);
        result.message.should.equal('原始密码错误');
        done();
      })
    })
    it('should response ok', function(done){
      opt.data.oldPassword = 'test12';
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.equal(true);
        done();
      })
    })
  })

  /***
  *  invitation
  */
  describe('#inviteCode()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/inviteCode';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('邀请码');
        res.body.should.include('邮箱');
        res.body.should.include('发送');
        done();
      })
    })
  })

  describe('#generateInviteCode()', function(){
    var opt = clone(tpl);
    opt.path = '/inviteCode/gen';
    it('should gen code right', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf:CSRF
      }
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.code.should.have.length(11);
        done();
      })
    })
    it('should gen code wrong', function(done){
      var a = config.admins;
      config.admins = [];
      Post(opt, function(res){
        res.should.have.status(302);
        res.body.should.include('/application');
        config.admins = a;
        done();
      })
    })
  })

  describe('#loadInviteCode()', function(){
    it('should load code content', function(done){
      var opt = clone(tpl);
      opt.path = '/load_inviteCode';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.content.codes.should.have.length(5);
        result.content.admin.should.be.ok;
        result.content.page.should.equal(1);
        result.content.pages.should.equal(1);
        code = result.content.codes[0];
        done();
      })
    })
  })

  describe('#sendInviteCode()', function(){
      var opt = clone(tpl);
    it('should response emailErr', function(done){
      opt.path = '/inviteCode/send?email=ded_@.c@';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.not.be.ok;
        result.warn.should.equal('请输入合法的email地址');
        done();
      })
    })
    it('should response fine', function(done){
      opt.path = '/inviteCode/send?email=sdafjlk@sd.com';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.be.ok;
        done();
      })
    })    
  })

  describe('#generateInviteCode()', function(){
    var opt = clone(tpl);
    opt.path = '/inviteCode/del';
    it('should del code right', function(done){
      opt.headers.cookie = COOKIE;
      opt.data = {
        _csrf:CSRF,
        code : code
      }
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.be.ok;
        done();
      })
    })
    it('should del code err', function(done){
      Post(opt, function(res){
        var result = JSON.parse(res.body);
        result.done.should.be.ok;
        done();
      })      
    })
  }) 
  describe('#loadInviteCode() check', function(){
    it('should load code content', function(done){
      var opt = clone(tpl);
      opt.path = '/load_inviteCode';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.content.codes.should.have.length(4);
        result.content.admin.should.be.ok;
        result.content.page.should.equal(1);
        result.content.pages.should.equal(1);
        code = result.content.codes[0];
        done();
      })
    })
  })
  
  /***
  *  square
  */
  describe('#showSquare', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/square';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        res.body.should.include('所有应用');
        res.body.should.include('dead_horse');
        done();
      })
    })
  })

  describe('#getSquareInfo()', function(){
    var opt = clone(tpl);
    it('should response all infos', function(done){
      opt.path = '/square/get/apps';
      opt.headers.cookie = COOKIE;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.apps.should.have.length(10);
        result.should.not.have.property('owner');
        done();
      })
    })
    it('should response dead_horse apps no limit', function(done){
      opt.path = '/square/get/apps?limit=1&nickName=dead_horse';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.apps.should.have.length(10);
        result.owner.should.equal('dead_horse@qq.com');
        result.apps[0].appDomain.should.equal('test10');
        done();
      })
    })
    it('should response limit 1 skip 1', function(done){
      opt.path = '/square/get/apps?limit=1&skip=1';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        result.apps.should.have.length(1);
        result.should.not.have.property('owner');
        result.apps[0].appDomain.should.equal('test9');
        done();
      })
    })
  })
  
  after(function(){
    app.close();
  })
})
