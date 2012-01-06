var app = require('../src/app');
var config = require('../src/config');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var cp = require('child_process');
var clone = utils.clone,
    Request = utils.Request,
    Get = utils.Get,
    Post = utils.Post,
    cookie = utils.cookie,
    tpl = utils.tpl;
var CSRF = '';
var COOKIE = '';
var retrieveKey = '';
var clear = function(done){
  db.users.drop();
  db.app_mem.drop();
  db.app_basic.drop();
  db.records.drop();
  cp.exec('rm -rf ' + config.github.keyDir+'/* ' + __dirname + '/temp/temp/* ' + __dirname+'/temp/apps/*',  done);
}

describe('regist controller test', function(){
  before(function(done){
   app.listen(1130); 
   clear(done);
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
        res.headers['set-cookie'][0].should.include('connect.sid');
        COOKIE = cookie(res.headers['set-cookie']);
        //set csrf
        CSRF = /<input type="hidden" value="(\w+)" id="_csrf">/.exec(res.body)[1];
        done();
      })
    })
  })

  describe('#checkRegist():handle regist req', function(){
    var opt = clone(tpl);
    opt.data = {
      newEmail : 'wrong!@@gmail.com',
      newUserName : 'wrong!name',
      newPassword : 'wrong',
      passwordCon : 'wrong',
      code : ''
    };
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
        res.body.should.include('target');
        done();
      })
    })
    it('should response nickName used', function(done){
      Post(opt, function(res){
        res.body.should.include('nickUsed');
        done();
      })      
    })
    it('should response email used', function(done){
      opt.data.newUserName = 'test123';
      Post(opt, function(res){
        res.body.should.include('emailUsed');
        done();
      })      
    })
    it('should response regist not admin done', function(done){
      opt.data.newEmail = 'user1@qq.com';
      opt.data.newUserName = 'user1';
      opt.data.newPassword = 'test12';
      opt.data.passwordCon = 'test12';
      db.findOne(config.dbInfo.collections.user, {email:'dead_horse@qq.com'}, function(err, data){
        opt.data.inviteCode = data.inviteCode[0];
        Post(opt, function(res){
          res.body.should.include('target');
          db.findOne(config.dbInfo.collections.user, {email:'dead_horse@qq.com'}, function(err, data){
            data.inviteCode.should.have.length(4);
            done();
          })
        })          
      })
    })
  })

  describe('#checkEmail(): check if email has problem', function(){
    var opt = clone(tpl);
    it('should response wrong email format', function(done){
      opt.path = '/regist/checkEmail?email=wrong@@email.com';
      Get(opt, function(res){
        res.body.should.include('请输入合法的email地址');
        done();
      })
    })
    it('should response repeat email', function(done){
      opt.path = '/regist/checkEmail?email=dead_horse@qq.com';
      Get(opt, function(res){
        res.body.should.include('该邮箱已经被注册');
        done();
      })
    })
    it('should response none warn', function(done){
      opt.path = '/regist/checkEmail?email=dead_horse@email.com';
      Get(opt, function(res){
        res.body.should.equal('{}');
        done();
      })     
    })    
  })

  describe('#checkName(): check if nick name has problem', function(){
    var opt = clone(tpl);
    it('should response wrong name format', function(done){
      opt.path = '/regist/checkName?name=wrong@name';
      Get(opt, function(res){
        res.body.should.include('昵称为2～20个字符或数字或._');
        done();
      })
    })

    it('should response wrong name format', function(done){
      opt.path = '/regist/checkName?name=dead_horse';
      Get(opt, function(res){
        res.body.should.include('该昵称已经被使用');
        done();
      })
    })
    it('should response nick name repeat', function(done){
      opt.path = '/regist/checkName?name=dead_horse1';
      Get(opt, function(res){
        res.body.should.include('{}');
        done();
      })
    })   
  })
  describe('#showRegistTips(): display the regist tips', function(){
    it('should display fine', function(done){
      var opt = clone(tpl);
      opt.path = '/registTips';
      Get(opt, function(res){
        res.body.should.include('激活您的帐号');
        done();
      })
    })
  })

  describe('#resend(): resend activate email', function(){
    var opt = clone(tpl);
    it('should response error of email not regist', function(done){
      opt.path = '/regist/resend?e=dead_horse@gmail.com';
      Get(opt, function(res){
        res.body.should.include('该email未注册');
        done();
      })
    })

    it('should response fine', function(done){
      opt.path = '/regist/resend?e=dead_horse@qq.com';
      Get(opt, function(res){
        res.body.should.include('mail.qq.com');
        done();
      })
    })
  })

  describe('#activate(): activate the account', function(){
    var opt = clone(tpl);
    it('should active error', function(done){
      opt.path = '/regist/activate?e=dead_horse@qq.com&k=abc';      Get(opt, function(res){
        res.body.should.include('无效的激活链接');
        done();
      })
    })

    it('should active fine', function(done){
      db.findOne(config.dbInfo.collections.user, {email:'dead_horse@qq.com'}, function(err, data){
        var key = data.activateKey;
        opt.path = '/regist/activate?e=dead_horse@qq.com&k='+key;
        Get(opt, function(res){
          res.headers.location.should.equal('/application');
          res.should.have.status(302);
          done();
        })
      })
    })
    it('should active not admin fine', function(done){
      db.findOne(config.dbInfo.collections.user, {email:'user1@qq.com'}, function(err, data){
        var key = data.activateKey;
        opt.path = '/regist/activate?e=user1@qq.com&k='+key;
        Get(opt, function(res){
          res.headers.location.should.equal('/application');
          res.should.have.status(302);
          done();
        })
      })
    })
  })

  describe('#resend(): already actived', function(){
    it('should response error of already actived', function(done){
      var opt = clone(tpl);
      opt.path = '/regist/resend?e=dead_horse@qq.com';
      Get(opt, function(res){
        res.body.should.include('该帐号已激活');
        done();
      })
    })
  })

  /***
  * retrieve test
  */
  describe('#showRetrieve(): shouw retrieve page', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/retrieve';
      Get(opt, function(res){
        res.body.should.include('填写注册邮箱');
        CSRF = /<input type="hidden" value="(\w+)" name="_csrf">/.exec(res.body)[1];
        COOKIE = cookie(res.headers['set-cookie']);
        done();
      })
    })
  })

  describe('#postRetrieve(): post retrieve action', function(){
    var opt = clone(tpl);
    opt.path = '/retrieve/post';
    it('should display invid email', function(done){
      opt.headers.cookie += COOKIE;
      opt.data = {_csrf : CSRF, userEmail : "dead_horse@gmail.com"};
      Post(opt, function(res){
        res.body.should.include('该email未注册');
        done();
      })
    })
    it('should display redirect', function(done){
      opt.data = {_csrf:CSRF, userEmail : "dead_horse@qq.com"}
      Post(opt, function(res){
        res.should.have.status(302);
        res.headers.location.should.include('mail.qq.com');
        done();
      })
    })
  })

  describe('#showRetrieveTips()', function(){
    it('should display the right page', function(done){
      var opt = clone(tpl);
      opt.path = '/retrieveTips';
      Get(opt, function(res){
        res.body.should.include('通过邮件内链接修改密码');
        done();
      })
    })
  })

  describe('#showResetPassword()', function(){
    var opt = clone(tpl);
    it('should show not valid', function(done){
      opt.path = '/resetPassword?e=dead_horse@qq.com&p=abc';
      Get(opt, function(res){
        res.body.should.include('无效的链接');
        done();
      })
    })
    it('should show right page', function(done){
      db.findOne(config.dbInfo.collections.user, {email:'dead_horse@qq.com'}, function(err, data){
        retrieveKey = data.retrieveKey;
        opt.path = '/resetPassword?e=dead_horse@qq.com&p='+retrieveKey;
        Get(opt, function(res){
          res.body.should.include('修改密码：');
          CSRF = /<input type="hidden" value="(\w+)" name="_csrf">/.exec(res.body)[1];
          COOKIE = cookie(res.headers['set-cookie']);
          done();
        })
      })
    })
  })

  describe('#resetPassword', function(){
    var opt = clone(tpl);
    opt.path = '/reset/password';
    it('should response passErr', function(done){
      opt.headers.cookie += COOKIE;
      opt.data = {
        email:'dead_horse@qq.com',
        key : 'abc',
        changePassword : 'test',
        changeConfirmation : 'test',
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.body.should.include('密码至少为6位');
        done();
      })
    })
    it('should response passDiff', function(done){
      opt.data.changePassword = 'test12';
      Post(opt, function(res){
        res.body.should.include('两次密码不一致');
        done();
      })
    })
    it('should response wrong link', function(done){
      opt.data.changeConfirmation = 'test12';
       Post(opt, function(res){
        res.body.should.include('错误的激活链接');
        done();
      })     
    })
    it('should response reset fine', function(done){
      opt.data.key = retrieveKey;
      Post(opt, function(res){
        res.should.have.status(302);
        res.headers.location.should.equal('/login');
        done();
      })
    })
  })
  /***
  *  login test
  */
  describe('#show(): show login page', function(){
    var opt = clone(tpl);
    it('should display right page', function(done){
      opt.path = '/login';
      Get(opt, function(res){
        res.body.should.include('填写登录信息');
        done();
      })
    })
    it('should display reset fine info', function(done){
      opt.headers.referer = '/resetpassword';
      Get(opt, function(res){
        res.body.should.include('密码重置成功');
        done();
      })
    })
    it('should display login warn', function(done){
      opt.headers.referer = '';
      opt.path = '/login?redirect_url=/application';
      Get(opt, function(res){
        res.body.should.include('请先登录后再访问此页面');
        COOKIE = cookie(res.headers['set-cookie']);
        CSRF = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/.exec(res.body)[1];
        done();
      })      
    })
  })

  describe('checkLogin()', function(){
    var opt = clone(tpl);
    opt.path = '/checkLogin';
    it('should response emailErr', function(done){
      opt.headers.cookie += COOKIE;
      opt.data = {
        email : 'dead_horse1@qq.com',
        pwd : 'unittest',
        _csrf : CSRF
      }
      Post(opt, function(res){
        res.body.should.include('emailErr');
        done();
      })
    })
    it('should response passErr', function(done){
      opt.data.email = 'dead_horse@qq.com';
      Post(opt, function(res){
        res.body.should.include('passErr');
        done();
      })
    })
    it('should response OK', function(done){
      opt.data.pwd = 'test12';
      Post(opt, function(res){
        res.body.should.include('ok');
        done();
      })     
    })
  })


  after(function(){
    app.close();
  })
})