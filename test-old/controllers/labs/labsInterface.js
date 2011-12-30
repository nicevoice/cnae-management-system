var testCase = require('nodeunit').testCase,
    count = require('../../../src/models/index').count,
    user = require('../../../src/config').dbInfo.collections.user,
    labs = require('../../../src/controllers/labs/labs_interface'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../../helper/mock'),
    secret = require('../../../src/config').labsConf.secret,
    md5 = require('../../../src/lib/md5').hex_md5;
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
var user ='unitTest@gmail.com';
var appCase = ['', 'Test', 'labs1'];
    secret = unescape(secret);
module.exports = testCase({
    setUp:function(cb){
        cb();
    },
    tearDown:function(cb){
        cb();
    },
    test_appadd_without_nick : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent(appCase[2]) + '&userName=&' +'sign='+
        md5(secret+appCase[2]+user+secret);
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {"status":"false", "code":"2", "msg":"Missing parameter:userName"});
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_appadd_without_appname : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent("") + '&userName=' +encodeURIComponent(user) +'&sign='+
        md5(secret+user+secret);
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {"status":"false", "code":"3", "msg":"Missing parameter:appName"});
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_appadd_with_wrong_appname : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent(appCase[1]) + '&userName=' +encodeURIComponent(user) +'&sign='+
        md5(secret+appCase[1]+user+secret).toUpperCase();
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {"status":"false", "code":"6", "msg":"AppName format error"});
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_appadd_with_wrong_sign : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent(appCase[1]) + '&userName=' +encodeURIComponent(user) +'&sign='+
        md5(secret+appCase[1]+user+secret);
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {"status":"false", "code":"5", "msg":"Invaild sign"});
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_appadd_ok : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent(appCase[2]) + '&userName=' +encodeURIComponent(user) +'&sign='+
        md5(secret+appCase[2]+user+secret).toUpperCase();
        testEvent.once('testNow', function(data){
            test.deepEqual(data.status, 'true');
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_appadd_repeat : function(test){        
        req.url = '/labs/appadd?appName='+
        encodeURIComponent(appCase[2]) + '&userName=' +encodeURIComponent(user) +'&sign='+
        md5(secret+appCase[2]+user+secret).toUpperCase();
        testEvent.once('testNow', function(data){
            test.deepEqual(data.status, 'false');
            test.done();
        });
        labs.appAdd(req, res);
    },
    test_delete_ok : function(test){
        req.url = '/labs/appdel?appName='+encodeURIComponent(appCase[2])+
        '&userName='+encodeURIComponent(user)+'&sign='+
         md5(secret+appCase[2]+user+secret).toUpperCase();
        testEvent.once('testNow', function(data){
            test.deepEqual(data.status, 'true');
            test.done();
        });
        labs.appDel(req, res);        
    }
})
