var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    user = require('../../src/config').dbInfo.collections.user,
    retrieve = require('../../src/controllers/retrieve'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');

var emailCase = ['wrong!@gmail.com', 'notexsit@gmail.com', 'unittest@gmail.com'],
    retrieveKey = "";    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
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
    test_post_retrieve_not_exist_email : function(test){
        req.body.userEmail = emailCase[2];
        testEvent.once('testNow', function(data){
            test.deepEqual(data, "/retrieveTips");
            findOne(user, {email:emailCase[2]}, function(err, data){
                data
            })
        });
        retrieve.postRetrieve(req, res);
    },  	
})
