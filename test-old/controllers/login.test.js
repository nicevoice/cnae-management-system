var testCase = require('nodeunit').testCase,
    EventProxy = require('EventProxy.js').EventProxy,
    login = require('../../src/controllers/login'),
    mock = require('../helper/mock');
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();


var email = "unitTest@gmail.com",
    wrongEmail = "unitTestxxx@gmail.com",
    password = "unittest",
    wrongPassword = "wrong",
    expectWrong = {page:"login", data:{warn:"用户名或密码错误"}},
    expectRight = "/application";
var wrongCase = [{email:wrongEmail, password:password, expect:expectWrong},
            {email:email, password:wrongPassword, expect:expectWrong},
            {email:wrongEmail, password:wrongPassword, expect:expectWrong}];
var rightCase = [{email:email, password:password, expect:expectRight, autoLogin:false},
                     {email:email, password:password, expect:expectRight, autoLogin:true}];   

module.exports = testCase({
  setUp:function(callback){
    callback();
  },
  tearDown:function(callback){
    callback();
  },

  check_login_wrong_Email:function(test){
    var wc = wrongCase[0];
    req.body.userEmail = wc.email,
    req.body.password = wc.password;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, wc.expect, "check wrong email error");
      test.done();
    });
    login.checkLogin(req, res);
  },
  check_login_wrong_password:function(test){
    var wc = wrongCase[1];
    req.body.userEmail = wc.email,
    req.body.password = wc.password;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, wc.expect, "check wrong password error");
      test.done();
    });
    login.checkLogin(req, res);
  },
  check_login_wrong_password_email:function(test){
    var wc = wrongCase[2];
    req.body.userEmail = wc.email,
    req.body.password = wc.password;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, wc.expect, "check wrong password email error");
      test.done();
    });
    login.checkLogin(req, res);
  },
  check_login_success_not_auto : function(test){
    var rc = rightCase[0];
    req.body.userEmail = rc.email,
    req.body.password = rc.password;
    req.body.autoLogin = rc.autoLogin;
    req.session = {
      cookie:{
      }
    };
    testEvent.once('testNow', function(data){
      test.deepEqual(data, rc.expect, "check login success error");
      test.deepEqual(req.session.cookie.expires, false, "check not auto login error");
      test.done();
    });
    login.checkLogin(req, res);
  },
  check_login_success_auto : function(test){
    var rc = rightCase[1];
    req.body.userEmail = rc.email,
    req.body.password = rc.password;
    req.body.autoLogin = rc.autoLogin;
    req.session = {
      cookie:{
      }
    };
    testEvent.once('testNow', function(data){
      test.deepEqual(data, rc.expect, "check login success error");
      test.ok(req.session.cookie.expires!==false, "check auto login error");
      test.done();
    });
    login.checkLogin(req, res);
  }
});