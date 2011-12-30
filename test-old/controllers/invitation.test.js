var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    findOne = require('../../src/models/index').findOne,
    user = require('../../src/config').dbInfo.collections.user,
    invitation = require('../../src/controllers/invitation'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
var admin = 'dead_horse@qq.com',
    notAdmin = 'checkIn@qq.com';
module.exports = testCase({
    setUp:function(cb){
        req.session.email = admin;
        cb();
    },
    tearDown:function(cb){
    cb();
    },
    test_admin_generate:function(test){
        var count;
        findOne(user, {email:req.session.email},
            function(err, data){
                count = data.inviteCode.length;
                testEvent.once('testNow', function(data){
                    test.deepEqual(data.status,'ok');
                    findOne(user, {email:req.session.email},function(err,data){
                        test.deepEqual(count, data.inviteCode.length-1, 'test db error');
                        test.done();
                    })
                });
                invitation.generateInviteCode(req, res);
            })
    },
    test_not_admin_generate:function(test){
        req.session.email = notAdmin;
        var count;
        findOne(user, {email:req.session.email},
            function(err, data){
                count = data.inviteCode.length;
                testEvent.once('testNow', function(data){
                    test.deepEqual(data.status,'ok');
                    findOne(user, {email:req.session.email},function(err,data){
                        test.deepEqual(count, data.inviteCode.length-1, 'test db error');
                        test.done();
                    })
                });
                invitation.generateInviteCode(req, res);
            })      
    }
})
