var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    findOne = require('../../src/models/index').findOne,
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock'),
    middle = require('../../src/routes/middleware');
        
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
var next = function(){
    testEvent.fire('testNow', "next");
}

module.exports = testCase({
    setUp:function(cb){
        req.session.email = "dead_horse@qq.com";
        req.session.nickName= "dead_horse";
        req.url = "/square";
        req.params.id = "whhhhat";
        cb();
    },
    tearDown:function(cb){
        cb();
    },
    test_hasLogin_without_email:function(test){
        req.session.email = "";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, '/login?redirect_url='+encodeURIComponent(req.url));
            test.done();
        })
        middle.hasLogin(req, res, next)
    },
    test_hasLogin_without_nick : function(test){
        req.session.nickName = "";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, '/login?redirect_url='+encodeURIComponent(req.url));
            test.done();
        })
        middle.hasLogin(req, res, next)
    },
    test_hasLogin_ok : function(test){
        testEvent.once('testNow', function(data){
            test.deepEqual(data, 'next');
            test.done();
        })
        middle.hasLogin(req, res, next)        
    },
    test_hasNotLogin_with_email:function(test){
        req.session.nickName = "";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, 'next');
            test.done();
        })
        middle.hasNotLogin(req, res, next)            
    },
    test_hasNotLogin_with_nick:function(test){
        req.session.email = "";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, 'next');
            test.done();
        })
        middle.hasNotLogin(req, res, next)            
    },
    test_hasNotLogin_with_nick:function(test){
        testEvent.once('testNow', function(data){
            test.deepEqual(data, "/application");
            test.done();
        })
        middle.hasNotLogin(req, res, next)            
    },
    test_checkAuth_wrong:function(test){
        req.session.email = "role4@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error', data:{message:"没有权限访问这个应用"}});
            test.done();
        });
        middle.checkAuth(req, res);
    },
    test_checkAuth_ok:function(test){
        req.session.email = "role3@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, 'next');
            test.done();
        });
        middle.checkAuth(req, res, next);
    },
    test_checkChangeAuth_no_view_auth:function(test){
        req.session.email = "role4@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error',data:{message:'没有权限访问这个应用'}});
            test.done();
        });
        middle.checkChangeAuth(2)(req, res, next);        
    },
    test_checkChangeAuth_no_view_auth:function(test){
        req.session.email = "role4@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error',data:{message:'没有权限访问这个应用'}});
            test.done();
        });
        middle.checkChangeAuth(2)(req, res, next);        
    },
    test_checkChangeAuth_no_change_auth:function(test){
        req.session.email = "role3@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, {page:'error',data:{message:'没有权限进行这个操作'}});
            test.done();
        });
        middle.checkChangeAuth(2)(req, res, next);        
    },
    test_checkChangeAuth_ok:function(test){
        req.session.email = "role3@gmail.com";
        testEvent.once('testNow', function(data){
            test.deepEqual(data, 'next');
            test.done();
        });
        middle.checkChangeAuth(3)(req, res, next);        
    }  
})
