var testCase = require('nodeunit').testCase,
    count = require('../../src/models/index').count,
    findOne = require('../../src/models/index').findOne,
    app_basic = require('../../src/config').dbInfo.collections.app_basic,
    appDevelop = require('../../src/controllers/appDevelop'),
    EventProxy = require('EventProxy.js').EventProxy,
    mock = require('../helper/mock');
    
var testEvent = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();
    
var files = 
{ upload: 
      { size: 230656,
        path: '/home/deadhorse/code/cnae_rebuild/tmp/ooxx.zip',
        name: 'ooxx.zip',
        type: 'application/zip',
        lastModifiedDate: "Sun, 13 Nov 2011 15:34:09 GMT",
        _writeStream: [Object],
        length: 230656,
        filename: 'ooxx.zip',
        mime:null  }
};
var cases = [{path:"/home/deadhorse/code/cnae_rebuild/tmp/ut1.zip",
                 name:"ut1.zip", filename:"ut1.zip"}
                 ];
var fields = {};

checkQueryString = function(queryString) {
  if(queryString.indexOf("db.") !== 0 && queryString.indexOf("show") !== 0) {
    return false;
  } else {
    if(queryString.indexOf("db.addUser") === 0 || queryString.indexOf("db.auth") === 0 || queryString.indexOf("db.removeUser") === 0 || queryString.indexOf("db.eval") === 0 || queryString.indexOf("db.dropDatabase") === 0 || queryString.indexOf("db.shoutdownServer") === 0 || queryString.indexOf("db.copyDatabase") === 0 || queryString.indexOf("db.cloneDatabse") === 0) {
      return false;
    } else {
      return true;
    }
  }
}

module.exports = testCase({
  setUp:function(cb){
    req.session = {email:"unitTest@gmail.com", nickName:"unit_test"};
    req.form = {fields:fields, files:files};
    req.params.id = "unit2";
    req.url = "/application/mamage/unit2/vermng";
    req.body.email = "unitTest@gmail.com";
    cb();
  },
  tearDown:function(cb){
    cb();
  },
    test_upload_code_gz:function(test){
    req.form.files.upload.path = '/home/deadhorse/code/cnae_rebuild/tmp/unit2.tar.gz';
    req.form.files.upload.type = 'application/x-gzip';
    req.form.files.upload.filename = 'unit2_nf.tar.gz';
    testEvent.once("testNow", function(data){
      test.deepEqual(data, "/application/mamage/unit2/sum");
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },
  test_upload_code_null:function(test){
    req.form = {fields:fields, files:{}};
    testEvent.once("testNow", function(data){
      test.deepEqual(data, {page:"error", data:{message:"请选择一个文件上传"}});
      test.done();
    })
    appDevelop.doUpload(req, res);
  },
  test_upload_code_no_filename:function(test){
    req.form = {fields:fields, files:{upload:{}}};
    testEvent.once("testNow", function(data){
      test.deepEqual(data, {page:"error", data:{message:"请选择一个文件上传"}});
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },
  test_upload_code_wrong_type :function(test){
    req.form.files.upload.type = "text/html";
    testEvent.once("testNow", function(data){
      test.deepEqual(data, {page:"error", data:{message:"请上传正确的格式"}});
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },

  test_upload_code_gz_noflode:function(test){
    req.form.files.upload.path = '/home/deadhorse/code/cnae_rebuild/tmp/unit2_nf.tar.gz';
    req.form.files.upload.type = 'application/x-gzip';
    req.form.files.upload.filename = 'unit2_nf.tar.gz';
    testEvent.once("testNow", function(data){
      test.deepEqual(data, "/application/mamage/unit2/sum");
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },

  test_upload_code_zip_noflode:function(test){
    req.form.files.upload.path = '/home/deadhorse/code/cnae_rebuild/tmp/unit2_nf.zip';
    req.form.files.upload.type = 'application/zip';
    req.form.files.upload.filename = 'unit2_nf.zip';
    testEvent.once("testNow", function(data){
      test.deepEqual(data, "/application/mamage/unit2/sum");
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },
  test_upload_code_zip:function(test){
    req.form.files.upload.path = '/home/deadhorse/code/cnae_rebuild/tmp/unit2.zip';
    req.form.files.upload.type = 'application/zip';
    req.form.files.upload.filename = 'unit2.zip';
    testEvent.once("testNow", function(data){
      test.deepEqual(data, "/application/mamage/unit2/sum");
      test.done();
    })
    appDevelop.doUpload(req, res);    
  },
  test_git_clone_wrong_url : function(test){
    req.body.gitUrl = "www.baidu.com";
    testEvent.once("testNow", function(data){
      test.deepEqual(data, {status:"error", msg:"请使用Git Read-Only方式获取代码"});
      test.done();
    });
    appDevelop.gitClone(req, res);
  },
  test_git_clone_readOnly : function(test){
    req.body.gitUrl = "git://github.com/dead-horse/eventproxy.git";
    testEvent.once("testNow", function(data){
      test.deepEqual(data, {status:"ok", msg:"成功获取"});
      test.done();
    });
    appDevelop.gitClone(req, res);    
  },
  test_npm_wrong : function(test){
    req.body.npmName = "npm_wrong webjs";
    testEvent.once('testNow', function(data){
      test.deepEqual(data.status, 'error');
      test.done();
    })
    appDevelop.npmInstall(req, res);
  },
  test_npm_right : function(test){
    req.body.npmName = "webjs mongodb express";
    testEvent.once('testNow', function(data){
      test.deepEqual(data.status, 'ok');
      test.done();
    })
    appDevelop.npmInstall(req, res);    
  },
  test_load_mongo_content : function(test){
    testEvent.once('testNow', function(data){
      test.deepEqual(data.status, 'ok');
      test.done();
    })
    appDevelop.loadMongoContent(req, res);    
  },
  test_query_mongo_not_exist : function(test){
    req.body.queryString = "show collections";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'error', msg:"数据库未申请或者数据库类型不是mongoDB"});
      test.done();
    })
    appDevelop.queryMongo(req, res);    
  },
  test_create_mongo : function(test){
    testEvent.once('testNow', function(data){
      test.deepEqual(data, '/application/mamage/unit2/mongo');
      test.done();
    })
    appDevelop.createMongo(req, res);
  },
  test_create_mongo_repeat : function(test){
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {page:'error', data:{message:"已经创建数据库"}});
      test.done();
    })
    appDevelop.createMongo(req, res);    
  },
  test_checkQueryString_wrong : function(test){
    var wrongWords = ['create', 'db.addUser', 'db.auth', 'db.removeUser', 'db.eval', 'db.dropDatabase', 'db.shoutdownServer', 'db.copyDatabase', 'db.cloneDatabse'];
    for(var i=0, len=wrongWords.length; i!=len; ++i){
      test.deepEqual(checkQueryString(wrongWords[i]), false);
    }
    test.done();
  },
  test_query_mongo_error:function(test){
    req.body.queryString = 'db.addUser';
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'error', msg:"该操作不被允许"});
      test.done();
    })
    appDevelop.queryMongo(req, res);     
  },
  test_query_mongo_ok:function(test){
    req.body.queryString = 'show collections';
    testEvent.once('testNow', function(data){
      test.deepEqual(data.status, 'ok');
      test.done();
    })
    appDevelop.queryMongo(req, res);     
  },
  test_load_todo_content:function(test){
    testEvent.once('testNow', function(data){
      test.deepEqual(data.status, 'ok');
      test.done();
    })
    appDevelop.loadTodoContent(req, res);   
  },
  test_new_todo_null:function(test){
    testEvent.once('testNow', function(data){
      test.deepEqual(data, '/application/manage/unit2/todo');
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(typeof result.todo==='undefined'|| result.todo.length===0);
        test.done();
      })
    })
    appDevelop.newTodo(req, res);  	
  },
  test_new_todo_ok:function(test){
  	req.body.title = "unit test";
    testEvent.once('testNow', function(data){
      test.deepEqual(data,'/application/manage/unit2/todo');
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo.length===1);
        test.done();
      })
    })
    appDevelop.newTodo(req, res);  	
  },
  test_load_todo_content_now:this.test_load_todo_content,
  test_finish_todo_not_exist:function(test){
  	 req.body.title = "unit_not_exist";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo[0].finished===0);
        test.done();
      })
    })
    appDevelop.finishTodo(req, res);    	 
  },
  test_finish_todo : function(test){
  	req.body.title = "unit test";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	console.log(result.todo);
      	test.ok(result.todo[0].finished===1);
        test.done();
      })
    })
    appDevelop.finishTodo(req, res);     	
  },
  test_recover_todo_not_exist:function(test){
  	 req.body.title = "unit_not_exist";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo[0].finished===1);
        test.done();
      })
    })
    appDevelop.recoverTodo(req, res);    	 
  },
  test_recover_todo : function(test){
  	req.body.title = "unit test";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo[0].finished===0);
        test.done();
      })
    })
    appDevelop.recoverTodo(req, res);     	
  }, 
  test_delete_not_exist:function(test){
  	 req.body.title = "unit_not_exist";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo.length===1);
        test.done();
      })
    })
    appDevelop.deleteTodo(req, res);      	
  }, 
  test_delete:function(test){
  	 req.body.title = "unit test";
    testEvent.once('testNow', function(data){
      test.deepEqual(data, {status:'ok'});
      findOne(app_basic,{appDomain:'unit2'},function(err, result){
      	test.ok(result.todo.length===0);
        test.done();
      })
    })
    appDevelop.deleteTodo(req, res);      	
  }
})
