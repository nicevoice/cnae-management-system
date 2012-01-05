var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    findOne = require('../../src/models/index').findOne,
    user = require('../../src/config').dbInfo.collections.user,
    commandLine = require('../../src/controllers/commandLine'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');
        
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
var email = 'unitTest@gmail.com',
    password = 'heyiyu',
    wrongPassword = 'heyiyu12',
    token = '';
module.exports = testCase({
    setUp:function(cb){
        cb();
    },
    tearDown:function(cb){
        cb();
    },
    test_without_email:function(test){
        req.url = '/commandline/token?email=&password='+encodeURIComponent(password);
        testEvent.once('testNow', function(data){
            test.ok(data.code===2);
            test.done();
        })
        commandLine.getToken(req, res);
    },
    test_without_password:function(test){
        req.url = '/commandline/token?email='+encodeURIComponent(email)
        +'&password='+encodeURIComponent('');
        testEvent.once('testNow', function(data){
            test.ok(data.code===3);
            test.done();
        })
        commandLine.getToken(req, res);
    },
    test_with_wrong_email:function(test){
        req.url = '/commandline/token?email='+encodeURIComponent('#'+email)
        +'&password='+encodeURIComponent(password);
        testEvent.once('testNow', function(data){
            test.ok(data.code===4);
            test.done();
        })
        commandLine.getToken(req, res);
    },
    test_without_wrong_password:function(test){
        req.url = '/commandline/token?email='+encodeURIComponent(email)
        +'&password='+encodeURIComponent(wrongPassword);
        testEvent.once('testNow', function(data){
            test.ok(data.code===5);
            test.done();
        })
        commandLine.getToken(req, res);
    },
    test_get_token_ok:function(test){
        req.url = '/commandline/token?email='+encodeURIComponent(email)
        +'&password='+encodeURIComponent(password);
        testEvent.once('testNow', function(data){
            test.ok(data.code===0);
            token = data.token;
            count(user, {email:email, token:token}, function(err ,count){
                test.ok(count===1, "check db");
                test.done();
            })
        })
        commandLine.getToken(req, res);
    },
    test_get_token_new:function(test){
        req.url = '/commandline/token?email='+encodeURIComponent(email)
        +'&password='+encodeURIComponent(password);
        testEvent.once('testNow', function(data){
            test.ok(data.code===0);
            test.ok(data.token!==token, 'check db');
            test.done();
        })
        commandLine.getToken(req, res);        
    }
})
