var testCase = require('nodeunit').testCase, EventProxy = require('EventProxy.js').EventProxy, count = require('../../src/models/index').count, collections = require('../../src/config').dbInfo.collections, application = require('../../src/controllers/application'), mock = require('../helper/mock');

var testEvent = mock.testEvent, req = new mock.Request(), res = new mock.Response();

var create_done = function(total, test) {
    return function() {
        if(--total === 0)
            test.done();
    }
}
req.session.email = "unitTest@gmail.com";
req.session.nickName = "unitTest";
var wrongCase = [{domain:"1unit", name:"1unit", except:{ page: 'newApp',
data:
{ layout: 'layoutMain',
warn: '子域名格式错误',
email: 'unitTest@gmail.com',
nickName: 'unitTest' } }},
{domain:"unit", name:"", except:{ page: 'newApp',
data:
{ layout: 'layoutMain',
warn: '必须有应用名称',
email: 'unitTest@gmail.com',
nickName: 'unitTest' } }
},
{domain:"unit1", name:"unit1", except:{ page: 'newApp',
data:
{ layout: 'layoutMain',
warn: '此域名已被占用',
email: 'unitTest@gmail.com',
nickName: 'unitTest' } }
},{domain:"unit11", name:"unit11", except: { page:"error",data: { message:"创建的应用数目已经达到上限"}}}];
var rightCase = [{
    domain : "unit1",
    name : "unit1",
    except : "/application"
}];

module.exports = testCase({
    setUp : function(callback) {
        callback();
    },
    tearDown : function(callback) {
        callback();
    },
    test_wrong_domain : function(test) {
        var tc = wrongCase[0];
        req.body.appDomain = tc.domain;
        req.body.appName = tc.name;
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, tc.except, "test wrong domain error");

            test.done();
        });
        application.createApp(req, res);
    },
    test_wrong_name : function(test) {
        var tc = wrongCase[1];
        req.body.appDomain = tc.domain;
        req.body.appName = tc.name;
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, tc.except, "test wrong name error");
            test.done();
        });
        application.createApp(req, res);
    },
    test_seccess : function(test) {
        var tc = rightCase[0];
        req.body.appDomain = tc.domain;
        req.body.appName = tc.name;
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, tc.except, "test success input error");
            test.done();
        });
        application.createApp(req, res);
    },
    test_repeat_domain : function(test) {
        var tc = wrongCase[2];
        req.body.appDomain = tc.domain;
        req.body.appName = tc.name;
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, tc.except, "test repeat domain error");
            test.done();
        });
        application.createApp(req, res);
    },
    test_create_db : function(test) {
        var done = create_done(4, test);
        count(collections.app_member, {
            email : "unitTest@gmail.com",
            appDomain : "1unit"
        }, function(err, count) {
            test.deepEqual(count, 0, "test wrong domain db member error");
            done();
        })
        count(collections.app_basic, {
            appDomain : "1unit"
        }, function(err, count) {
            test.deepEqual(count, 0, "test wrong domain db basic error");
            done();
        })
        count(collections.app_member, {
            email : "unitTest@gmail.com",
            appDomain : "unit1"
        }, function(err, count) {
            test.deepEqual(count, 1, "test right domain db member error");
            done();
        });
        count(collections.app_basic, {
            appDomain : "unit1"
        }, function(err, count) {
            test.deepEqual(count, 1, "test right domain db basic error");
            done();
        });
    },
    test_delete_app_wrong_user : function(test) {
        req.session.email = "wrongUser@gmail.com";
        req.body.domain = "unit1";
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, {
                status : "error",
                msg : "该应用不存在或没有权限删除此应用"
            }, "test delete other's app error");
            test.done();
        });
        application.deleteApp(req, res);
    },
    test_delet_app_wrong_domain : function(test) {
        req.session.email = "unitTest@gmail.com";
        req.body.domain = "uniterror";
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, {
                status : "error",
                msg : "该应用不存在或没有权限删除此应用"
            }, "test delete not exist app error");
            test.done();
        });
        application.deleteApp(req, res);
    },
    test_delet_app_success : function(test) {
        req.session.email = "unitTest@gmail.com";
        req.body.domain = "unit1";
        testEvent.once('testNow', function(data) {
            test.deepEqual(data, {
                status : "ok"
            }, "test delete other's app error");
            test.done();
        });
        application.deleteApp(req, res);
    },
    test_delete_app_db : function(test) {
        var done = create_done(2, test);
        count(collections.app_member, {
            email : "unitTest@gmail.com",
            appDomain : "unit1"
        }, function(err, count) {
            test.deepEqual(count, 0, "test right domain db member error");
            done();
        });
        count(collections.app_basic, {
            appDomain : "unit1"
        }, function(err, count) {
            test.deepEqual(count, 0, "test right domain db basic error");
            done();
        });
    }
})