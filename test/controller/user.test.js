var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    findOne = require('../../src/models/index').findOne,
    userDb = require('../../src/config').dbInfo.collections.user,
    user = require('../../src/controllers/user'),
    EventProxy = require('EventProxy.js').EventProxy,
    md5 = require('../../src/lib/md5').hex_md5,
    mock = require('../helper/mock'),
    secret = require('../../src/config').md5_secret;
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
       
var wrongNick = "unit-test!",
    existNick = "dead_horse",
    nick = "unit_test",
    realName = "test",
    wrongPage = "htttp:///test.test.test",
    page = "http://www.baidu.com",
    mobile = "13511112222",
    wrongMobile = "13321562213-1",
    password = "unittest";
    wrongPassword = "unit"; 
    password1 = "heyiyu",
    password2 = "heyiyu1";
req.session.email = "unitTest@gmail.com"; 
req.session.nickName = "unit_test";
module.exports = testCase({
  setUp : function(cb){
    req.body.changeNickName = nick;
    req.body.changeRealName = realName;
    req.body.changeTelNumber = mobile;
    req.body.changeMainPage = page;
    req.body.oldPassword = password;
    req.body.changePassword = password1;
    req.body.changeConfirmation = password1;
    cb();
  },
  tearDown: function(cb){
    cb();
  },
  
  //doChangeInfo
  test_wrong_nick : function(test){
     req.body.changeNickName = wrongNick;
     testEvent.once('testNow', function(data){
       test.deepEqual(data 
         ,{done:false, message:"请输入正确的昵称"}
         ,"test wrong nick error");
       test.done();
     });
     user.doChangeInfo(req, res);
  },
  test_wrong_mobile : function(test){
     req.body.changeTelNumber = wrongMobile;
     testEvent.once('testNow', function(data){
       test.deepEqual(data 
         ,{done:false, message:"请输入正确的手机号码"}
         ,"test wrong mobile error");
       test.done();
     });
     user.doChangeInfo(req, res);
  },
  test_wrong_main_page : function(test){
     req.body.changeMainPage = wrongPage;
     testEvent.once('testNow', function(data){
       test.deepEqual(data 
         ,{done:false, message:"请输入正确的个人主页"}
         ,"test wrong main page error");
       test.done();
     });
     user.doChangeInfo(req, res);
  },
    test_repeat_nick : function(test){
     req.body.changeNickName = existNick;
     testEvent.once('testNow', function(data){
       test.deepEqual(data 
         ,{done:false, message:"昵称已存在"}
         ,"test repeat nick error");
       test.done();
     });
     user.doChangeInfo(req, res);
  },
  test_wrong_change_db : function(test){
    findOne(userDb, {email:req.session.email}, function(err, data){
      test.notDeepEqual(data.nick, existNick, "repeat nick error");
      test.notDeepEqual(data.nickName, wrongNick, "wrong nick error");
      test.notDeepEqual(data.telNumber, wrongMobile, "number error");
      test.notDeepEqual(data.mainPage, wrongPage, "page error");      
      test.done();
    })
  },
  test_right_change : function(test){
     testEvent.once('testNow', function(data){
       test.deepEqual(data 
         ,{done:true}
         ,"test success change error");
       test.deepEqual(req.session.nickName, nick, "set session wrong");
       test.done();
     });
     user.doChangeInfo(req, res);
  },
  test_after_change_right : function(test){
    count(userDb, {email:req.session.email, nickName:nick,
      realName:realName, telNumber:mobile, mainPage:page}, function(err, count){
        test.deepEqual(count, 1);
        test.done();
      })
  },
  
  //change password
  test_wrong_old_password : function(test){
    req.body.oldPassword = password2;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {done:false,message:"原始密码错误"});
      test.done();
    })
    user.doChangePassword(req, res);
  },
  test_wrong_new_password : function(test){
    req.body.changePassword = wrongPassword;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {done:false,message:"密码必须为6～20位字符或者数字"});
      test.done();
    })
    user.doChangePassword(req, res);
  },
  test_wrong_conf_password : function(test){
    req.body.changePassword = password2;
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {done:false,message:"两次密码必须一致"});
      test.done();
    })
    user.doChangePassword(req, res);
  },
  test_after_wrong_change_password_db : function(test){
    findOne(userDb, {email:req.session.email}, function(err, data){
      var pword = data.password;
      test.notDeepEqual(pword, md5(password1));
      test.notDeepEqual(pword, md5(password2));
      test.notDeepEqual(pword, md5(wrongPassword));
      test.done();
    })
  },
  test_success_change_password:function(test){
    console.log(req.body.changePassword);
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {done:true}, "change password error");
      test.done();
    });
    user.doChangePassword(req, res);
  },
  test_after_success_change_password_db : function(test){
    console.log(password1);
    count(userDb, {email:req.session.email, password:md5(password1+secret)}, function(err, count){
      test.deepEqual(count, 1);
      test.done();
    })
  }  
})
