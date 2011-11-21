var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    models = require('../../src/models/index'),
    findOne = models.findOne,
    find = models.find,
    count = models.count,
    collections = require('../../src/config').dbInfo.collections,
    app_basic = collections.app_basic,
    app_member = collections.app_member,
    appManager = require('../../src/controllers/appManager'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
    

module.exports = testCase({
	setUp:function(cb){
		req.session = {email:"unitTest@gmail.com", nickName:"unit_test"};
		req.params = {id : 'unit2'};
		req.body = {};
		cb();
	},
	tearDown:function(cb){
		cb();
	},
	test_getallapps:function(test){
		testEvent.once('testNow', function(data){
			test.deepEqual(data.status, "ok");
			find(app_member, {email:req.session.email, active:1}, function(err, data){
				test.deepEqual(data.length, 2);
				test.done();
			})
		})
		appManager.getAllApps(req, res);
	},
	test_appmng_none_name : function(test){
		req.body.newAppName = "";
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error', msg:"请输入应用名称"});
			count(app_basic,{appDomain:'unit2', appName:""}, function(err, count){
				test.deepEqual(count, 0);
				test.done();
			})
		});
		appManager.doAppmng(req, res);
	},
	test_appmng_ok : function(test){
		req.body.newAppName = "unittest2";
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:"ok"});
			count(app_basic,{appDomain:'unit2', appName:"unittest2"}, function(err, count){
				test.deepEqual(count, 1);
				test.done();
			})
		});
		appManager.doAppmng(req, res);		
	},
	test_load_coop:function(test){
		testEvent.once('testNow', function(data){
			test.deepEqual({status:data.status,
							email:data.content.own.email,
							memlength:data.content.mems.length},
							{status:"ok", 
							 email:req.session.email,
							 memlength:1});
			test.done();
		});
		appManager.loadCoopmng(req, res);	
	},
	test_invite_coop_none:function(test){
		req.body.role = '1';
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error',msg:'请输入邮箱'});
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===1);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);
	},
	test_invite_coop_wrong_role:function(test){
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error',msg:'错误的角色信息'});
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===1);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);		
	},
	test_invite_coop_wrong_role:function(test){
		req.body.role='1';
		req.body.inviteEmail = 'wrong!email@gmail.com'
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error',msg:'请输入正确的email地址'});
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===1);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);		
	},
	test_invite_coop_own : function(test){
		req.body.role='1';
		req.body.inviteEmail = 'unitTest@gmail.com';
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error',msg:'不能邀请自己'});
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===1);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);		
	},
	test_invite_coop_ok : function(test){
		req.body.role='1';
		req.body.inviteEmail = 'coop_Test@gmail.com';
		testEvent.once('testNow', function(data){
			test.deepEqual(data.status, 'ok');
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===2);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);				
	},
	test_invite_coop_ok : function(test){
		req.body.role='1';
		req.body.inviteEmail = 'coop_Test@gmail.com';
		testEvent.once('testNow', function(data){
			test.deepEqual(data, {status:'error', msg:'不能邀请已参加用户'});
			count(app_member, {appDomain:'unit2'}, function(err, count){
				test.ok(count===2);
				test.done();
			})
		})
		appManager.doCoopmng(req, res);				
	}	
})
