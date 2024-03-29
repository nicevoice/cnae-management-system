var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    find = require('../../src/models/index').find,
    user = require('../../src/config').dbInfo.collections.user,
    regist = require('../../src/controllers/regist'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
    
var wrongEmail = "unitTestWrong!@gmail.com",
    wrongNick = "unitTest!Wrong",
    existEmail = "dead_horse@qq.com",
    existNick = "dead_horse",
    email = "checkinvite@gmail.com",
    nick = "checkinvite",
    passwordF = "unittest",
    passwordS = "test",
    inviteCode = "QP04ZMdqzqY",
    wrongInviteCode = "unittest";
    
    
module.exports = testCase({
  setUp:function(callback){
    req.body = {
      newEmail:email,
      newUserName:nick,
      newPassword:passwordF,
      passwordCon:passwordF,
      inviteCode:inviteCode
    };
    callback();
  },
  tearDown:function(callback){
    callback();
  },
  
  //checkRegist
  test_regist_wrong_email:function(test){
      req.body.newEmail = wrongEmail;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      { page: 'regist',
        data: 
        { layout: false,
          regist: {
            email: wrongEmail,
            code: inviteCode,
            nick: nick },
          warn: { email: '请输入合法的email地址' } } },
      "show error");
      count(user, {email:wrongEmail, nickName:nick}, function(err, count){
        test.deepEqual(count, 0, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);
  },
  
  test_regist_wrong_nick:function(test){
      req.body.newUserName = wrongNick;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
        { page: 'regist',
          data: 
           { layout: false,
             regist: 
              { email: email,
                code: inviteCode,
                nick: wrongNick },
             warn: { nick: '昵称不能包含特殊字符' } } },
      "show error");
      count(user, {email:email, nickName:wrongNick}, function(err, count){
        test.deepEqual(count, 0, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);  
  },

  test_regist_wrong_password:function(test){
      req.body.newPassword = passwordS;
      req.body.passwordCon = passwordS;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      {page:"regist", data:{
            layout:false,
            regist:{
            email:email,
            code:inviteCode,
            nick:nick
            },
            warn:{pass:"密码必须大于6位"}}},
      "show error");
      count(user, {email:email, nickName:nick}, function(err, count){
        test.deepEqual(count, 0, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);  
  },
    
  test_regist_diiferent_password:function(test){
      req.body.passwordCon = passwordS;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      {page:"regist", data:{
            layout:false,
            regist:{
            email:email,
            code:inviteCode,
            nick:nick
            },
            warn:{con:"两次密码输入不一致"}}},
      "show error");
      count(user, {email:email, nickName:nick}, function(err, count){
        test.deepEqual(count, 0, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);     
  },
  
  test_regist_repeat_email:function(test){
      req.body.newEmail = existEmail;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      {page:"regist", data:{
            layout:false,
            regist:{
            email:existEmail,
            code:inviteCode,
            nick:nick
            },
            warn:{email:"该邮箱已经被注册"}}},
      "show error");
      count(user, {email:existEmail}, function(err, count){
        test.deepEqual(count, 1, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);   
  }, 
  test_regist_repeat_nick:function(test){
      req.body.newUserName = existNick;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      {page:"regist", data:{
            layout:false,
            regist:{
            email:email,
            code:inviteCode,
            nick:existNick
            },
            warn:{nick:"该昵称已经被使用"}}},
      "show error");
      count(user, {nickName:existNick}, function(err, count){
        test.deepEqual(count, 1, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);   
  }, 
        
  test_regist_wrong_invitecode:function(test){
      req.body.inviteCode = wrongInviteCode;
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      {page:"regist", data:{
            layout:false,
            regist:{
            email:email,
            code:wrongInviteCode,
            nick:nick
            },
            warn:{code:"邀请码不正确"}}},
      "show error");
      count(user, {email:email, nickName:nick}, function(err, count){
        test.deepEqual(count, 0, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);      
  }, 
  test_regist_right:function(test){
      testEvent.once('testNow', function(data){
       test.deepEqual(data,
      "/application",
      "show error");
      count(user, {email:email, nickName:nick}, function(err, count){
        test.deepEqual(count, 1, "db error");
        test.done();
      })
      });
      regist.checkRegist(req, res);        
  },
  test_code_delete:function(test){
    find(user, {inviteCode:inviteCode}, function(err, data){
        test.deepEqual(data, []);
        test.done();
    })  
  },
  //checkEmail
  test_checkEmail_right:function(test){
    req.body.email = "testUnit1@gmail.com";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {}, "check error");
      test.done();
    })
    regist.checkEmail(req, res);  
  },
  test_checkEmail_wrong_format:function(test){
    req.body.email = wrongEmail;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {warn:"请输入合法的email地址"}, "check error");
      test.done();
    })
    regist.checkEmail(req, res);     
  },
  test_checkEmail_repeat:function(test){
    req.body.email = email;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {warn:"该邮箱已经被注册"}, "check error");
      test.done();
    })
    regist.checkEmail(req, res);              
  },
  
  //checkName
  test_checkName_right:function(test){
    req.body.name = "testUnit1";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {}, "check error");
      test.done();
    })
    regist.checkName(req, res);          
  },
  test_checkName_wrong_format:function(test){
    req.body.name = wrongNick;    
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {warn:"昵称为2～20个字符或数字或._"}, "check error");
      test.done();
    })
    regist.checkName(req, res);          
  },
  test_checkName_repeat:function(test){
    req.body.name = nick;
    req.session.nickName = "";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {warn:"该昵称已经被使用"}, "check error");
      test.done();
    })
    regist.checkName(req, res);          
  } 
})