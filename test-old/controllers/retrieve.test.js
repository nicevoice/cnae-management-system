var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    user = require('../../src/config').dbInfo.collections.user,
    findOne = require('../../src/models/index').findOne,
    retrieve = require('../../src/controllers/retrieve'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');

var emailCase = ['wrong!@gmail.com', 'notexsit@gmail.com', 'dead_horse@qq.com'],
    retrieveKey = "";    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
    
    var key = "";
module.exports = testCase({
	setUp:function(cb){
        cb();
	},
	tearDown:function(cb){
	    cb();
	},
    test_post_retrieve_wrong_email : function(test){
        req.body.userEmail = emailCase[0];
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error', data:{message:'email格式不正确'}});
            test.done();
        });
        retrieve.postRetrieve(req, res);
    },
    test_post_retrieve_not_exist_email : function(test){
        req.body.userEmail = emailCase[1];
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error', data:{message:'email未注册'}});
            test.done();
        });
        retrieve.postRetrieve(req, res);
    },
    test_post_retrieve_ok: function(test){
        req.body.userEmail = emailCase[2];
        testEvent.once('testNow', function(data){
            test.deepEqual(data, "/retrieveTips");
            findOne(user, {email:emailCase[2]}, function(err, result){
                key = result.retrieveKey;
                test.ok(result.retrieveKey!==undefined);
                test.ok(new Date() - result.retrieveTime<=200);
                test.done();
            })
        });
        retrieve.postRetrieve(req, res);
    },
    test_show_reset_wrong_key:function(test){
        req.url = "/resetPassword?e="+emailCase[2]+'&k=wrong';
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error', data:{message:'错误的链接'}});
            test.done();
        });
        retrieve.showResetPassword(req, res);        
    },
    test_show_reset_ok:function(test){
        req.url = "/resetPassword?e="+emailCase[2]+'&p='+key;
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'resetPassword', data:{email:emailCase[2], key:key}});
            test.done();
        });
        retrieve.showResetPassword(req, res);           
    },
    test_reset_password_wrong_email : function(test){
        req.body.email = emailCase[1];
        req.body.key = key;
        req.body.changePassword = "123456";
        req.body.changeConfirmation = "123456";
         testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error', data:{message:"错误的验证码"}});
            test.done();
        });
        retrieve.resetPassword(req, res);       
    },
    test_reset_password_ok : function(test){
        req.body.email = emailCase[2];
        req.body.key = key;
        req.body.changePassword = "heyiyu";
        req.body.changeConfirmation = "heyiyu";
         testEvent.once('testNow', function(data){
            test.deepEqual(data, '/login');
            findOne(user, {email:emailCase[2]}, function(err, data){
                test.deepEqual(data.retrieveKey,null);
                test.deepEqual(data.retrieveTime,null);
                test.done();
            })
        });
        retrieve.resetPassword(req, res);       
    }  	
})
