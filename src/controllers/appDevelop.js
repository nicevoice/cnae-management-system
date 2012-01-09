var config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    exec = require('child_process').exec,
    execFile = require('child_process').execFile,
    EventProxy = require('EventProxy.js').EventProxy,
    Step = require('../lib/step'),
    log = config.logWithFile,
    uploadDir = config.uploadDir

    
    
    //models
    ,
    model = require('../models/index'),
    collectionNames = require('../config').dbInfo.collections,
    user = collectionNames.user,
    app_mem = collectionNames.app_member,
    app_basic = collectionNames.app_basic,
    app_record = collectionNames.app_record,
    find = model.find,
    findOne = model.findOne,
    update = model.update,
    insert = model.insert
    
    
    
    //utils
    ,
    utils = require('../lib/utils'),
    doGitClone = utils.doGitClone,
    randomStringNum = utils.getRandomStringNum,
    doGit = utils.doGit,
    verify = utils.verify,
    match = utils.match
    
    
    
    //jscex
    ,
    Jscex = require('../lib/jscex/jscex-jit')
    
    
    
     require('../lib/jscex/jscex-async').init(Jscex);
var jscexify = require('../lib/jscex/jscex-async-node').getJscexify(Jscex),
    standard = jscexify.fromStandard;

var mkdirAsync = standard(fs.mkdir);
var execAsync = standard(exec);

/**
 *  显示代码管理页面
 */
exports.vermng = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManageCode", {
    layout: "layoutApp",
    url: url,
    nickName: req.session.nickName,
    email: req.session.email
  });
};

/***
 * 上传代码，gz zip格式
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.doUpload = function(req, res, next) {
  var domain = req.params.id || '';
  var fields = req.body,
      files = req.files;
  var filePath = files.upload ? files.upload.filename : null;
  //check file
  if (!filePath) {
    return next(new Error('请选择一个文件'));
  }
  log.info(req.session.email + ' try upload to ' + domain);
  //check type
  var type = files.upload.type,
      path = files.upload.path;
  if (!(type === "application/zip" || type==="application/octet-stream" ||
   type==="application/x-zip-compressed")) {
    return next(new Error("文件格式不正确"));
  }
  var tempDir = config.tempDir,
      savePath = uploadDir + '/' + domain + '/';
  //use jscex to do this
  var upload = eval(Jscex.compile("async", function() {
    try {
      //mkdir
      try {
        $await(mkdirAsync(tempDir + "/" + domain, '777'));
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
	  //console.log('mkdir done')
      //uncompress
      var unCompress = 'unzip -oq ' + path + ' -d ' + tempDir + '/' + domain;
      try {
        var out = $await(execAsync(unCompress));
      }catch(err){
        return next (new Error('解压缩失败，请确认上传文件是否正确'));
      }
	  //console.log('unCompress done')
      //check if only has a dir
      var files = $await(standard(fs.readdir)(tempDir + '/' + domain));
	  //console.log('get dir info done')
      var move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + domain + " " + savePath;
      if (files.length === 1) {
        var stat = $await(standard(fs.stat)(tempDir + '/' + domain + "/" + files[0]));
        if (stat.isDirectory()) { //if noly has a dir
          move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + domain + "/" + files[0] + " " + savePath;
        }
      }
      //mkdir of target path
      try {
        $await(mkdirAsync(savePath, '777'));
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
	  //console.log('mkdir target done')
      //move to the target dir
      try {
        $await(execAsync(move));
      } catch (err) {}
	  //console.log('move done')
      var sumManage = req.url.slice(0, req.url.lastIndexOf('/'));
      sumManage += '/sum';
      //start the two stuff at the same time & ignore the error
      try {
        var rmPath = execAsync("rm -rf " + path);
        rmPath.start();
      } catch (err) {
        log.warn(err.toString());
      }
      try {
        $await(execAsync("rm -rf " + tempDir + '/' + domain));
      } catch (err) {
        log.warn(err.toString());
      }
      $await(rmPath);
      return res.redirect(sumManage);
    } catch (err) {
      log.error(err.toString());
      try {
        var rmPath = execAsyncIgnore("rm -rf " + path);
        rmPath.start();
      } catch (err) {
        log.warn(err.toString());
      }
      try {
        $await(execAsyncIgnore("rm -rf " + tempDir + '/' + domain));
      } catch (err) {
        log.warn(err.toString());
      }
      $await(rmPath);
    }
  }));
  upload().start();
}

var gitFilter = function(command){
  if(/git(\s)+config/.test(command)){
    return true;
  }
  return false;
}
exports.gitAction = function(req, res){
  var command = req.body.gitCommand||'',
      domain = req.params.id||'';
  log.info(req.session.email + ' try to do git action ' + command + ' to ' + domain);
  if(!verify('gitAction', command)){
	  return res.sendJson({status:"error", msg:"不是有效的git操作"});
	}
  if(gitFilter(command)){
    return res.sendJson({status:"error", msg:"该操作不被允许"});
  }
  log.info(command + ' ok');
	var cb = function(data){
	  return res.sendJson(data);
	}
	if(verify('gitClone', command)){
		findOne(user, {email:req.session.email}, function(err, data){
			if(err){
				log.error(err.toString());
			  return res.sendJson({status:"error", msg:config.dbError});
			}
			if(data.github&&data.github.token){
	  		command = command.replace('@', '@'+data.github.token+'.');	//如果是clone需要权限的，就加上token
	  	}
	  	doGit(command, domain, cb, true);
	  })
	}else{
	  doGit(command, domain, cb);
	}
}

/***
 *
 * @param {} req
 * @param {} res
 */
exports.doDownload = function(req, res) {
  var domain = req.params.id || '',
      files = req.body.files||'',
      zipDir = uploadDir;
  files = files.trim().replace(/\.\./g, '');
  //如果没有输入files，则压缩整个文件夹
  log.info(req.session.email + ' download ' + domain);
  if(!files){
  	files = domain;
  }else{
    if(!verify('files', files)){
        log.info(files + 'not pass in download');
    	return res.sendJson({
    	  status:'error',
    	  msg:'错误的文件名或通配符'	
    	})
  	 }
    log.info(files + 'pass download')
    var arr = files.split(" ");//split
    for(var i=0, len=arr.length; i!=len; ++i){
      arr[i] = domain + '/' + arr[i];
    }
    if(arr.length>0){
      files = arr.join(' ');
    }
  }
  //生成压缩包名
  var now = new Date();
  var name = domain + "_" + now.getTime() + ".zip";
  var saveName = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "/download/" + name;	
  
  var compress = "cd " + zipDir + "&&zip -r " + saveName + " " + files;
  exec(compress, function(err, stdout, stderr) {
    if(err) {
    	if(err.code===12){
    	  return res.sendJson({
    	    status:"error",
    	    msg:"没有找到匹配的文件"	
    	  })	
    	}
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: err.toString()
      });
    } else {
      return res.sendJson({
        status: "ok",
        url: "/download/" + name
      });
    }
  })
}

exports.downloading = function(req, res, next) {
  var name = req.params.id || '',
      domain = name.slice(0, name.lastIndexOf("_"));
  findOne(app_mem, {
    email: req.session.email,
    appDomain: domain
  }, function(err, data) {
    if (err) {
      log.error(err.toString());
      return next(err);
    } else {
      if (data.role && data.active && data.role <= 2 && data.active === 1) {
        return res.redirect("/download/" + name + ".zip");
      } else {
        return next(new Error('没有权限下载这个应用'));
      }
    }
  })
}
/***
 * 上传
 * todo：上传大小限制
 * @param {} req
 * @param {} res
 */
exports.doUploadImg = function(req, res) {
  var domain = req.params.id || "",
      dirPath = req.body.dirPath || "",
      savePath = require('path').join(uploadDir, domain, dirPath, req.files.upload.name);
  utils.upload(req.files, savePath, function(result){
    res.sendJson(result);
  });
}

/***
 * 进行npm install 操作
 * @param {Object} req
 * @param {Object} res
 */
exports.npmInstall = function(req, res) {
  var npmName = req.body.npmName || '';
  var items = match('npm', npmName);
  npmName = items ? items[0] : null;
  log.info(req.session.email + ' npm install ' + npmName);
  if(!verify('npm', npmName)){
      log.info(npmName + ' not pass npm check');
      return res.sendJson({
          status:'error',
          msg:'请输入正确的模块名'
      })
  }
  log.info(npmName + ' pass npm check') 
  var domain = req.params.id || '', install = "npm install " + npmName;
  install = 'cd '+ uploadDir + '/' + domain + '&&' + install;
  exec(install, {timeout:60000}, function(err, npmStdout, npmStderr) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: err.toString()
      });
    } else {
      return res.sendJson({
        status: "ok",
        msg: npmStdout
      });
    }
  });
}
exports.showMongo = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManageMongo", {
    layout: "layoutApp",
    url: url,
    nickName: req.session.nickName,
    email: req.session.email
  });
}

exports.loadMongoContent = function(req, res) {
  var domain = req.params.id || '';
  findOne(app_basic, {
    appDomain: domain
  }, function(err, data) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: config.dbError
      });
    } else {
      findOne(user, {
        email: req.session.email
      }, function(err, user) {
        if (err) {
          log.error(err.toString());
          return res.sendJson({
            status: "error",
            msg: config.dbError
          });
        }
        return res.sendJson({
          status: 'ok',
          content: {
            dbType: data.appDbType,
            dbUserName: user.dbUserName,
            dbPassword: user.dbPassword,
            dbName: data.appDbName,
            appDb: config.appDb
          }
        });
      });
    }
  })
}
exports.createMongo = function(req, res, next){
  var domain = req.params.id || '';
  var url = req.url;
  var email = req.session.email;
  url = url.slice(0, url.lastIndexOf('/'));
  var dbName = '';
  Step(function getUser(){
      findOne(app_basic, {
        appDomain : domain
      }, this)
    },
    function getDbInfo(err, data){
      if(err) {
        log.error(err.toString());
        return next(err);
      }
      if(data.appDbType) return next (new Error("已创建数据库"));
      findOne(user, {
        email: req.session.email
      }, {
        dbUserName: 1,
        dbPassword: 1
      }, this);
    },
    function execCommand(err, dbUser){
      if(err) {
        log.error(err.toString());
        return next(err);
      }
      dbName = randomStringNum(12);
      var shPath = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + 
      "shells/mongoAllocator.sh ";
      var args = [dbName, dbUser.dbUserName, dbUser.dbPassword, config.appDbAdmin.userName,
                  ,config.appDb.port, config.appDbAdmin.password];
      var command = shPath + ' ' + args.join(' ');
      exec(command, {timeout : 10000}, this);     
    },
    function updateDb(err, data){
      if(err) {
        log.error(err.toString());
        return next(err);
      }
      update(app_basic, {
        appDomain: domain
      }, {
        $set: {
          appDbType: "mongo",
          appDbName: dbName
        }
      }, function(err) { //更新应用表
        if(err) {
          log.error(err.toString());
          return next(err);
        }
        return res.redirect(url + "/mongo");
      })
    }
  );
}

checkQueryString = function(queryString) {
  if (queryString.indexOf("db.") !== 0 && queryString.indexOf("show") !== 0) {
    return false;
  } else {
    if (queryString.indexOf("db.addUser") === 0 ||
        queryString.indexOf("db.auth") === 0 || 
        queryString.indexOf("db.removeUser") === 0 || 
        queryString.indexOf("db.eval") === 0 || 
        queryString.indexOf("db.dropDatabase") === 0 
        || queryString.indexOf("db.shoutdownServer") === 0 
        || queryString.indexOf("db.copyDatabase") === 0 
        || queryString.indexOf("db.cloneDatabse") === 0) {
      return false;
    } else {
      return true;
    }
  }
}

exports.queryMongo = function(req, res) {
  var domain = req.params.id || '',
      queryString = req.body.queryString.trim() || '';
  if (!checkQueryString(queryString)) {
    return res.sendJson({
      status: "error",
      msg: "该操作不被允许"
    });
  }
  queryString = queryString.replace(/\$/g, '\\$').
              replace(/"/g, '\\"');
  queryString = "\"" + queryString + "\"";
  findOne(user, {
    email: req.session.email
  }, function(err, data) { //查找db帐号密码
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: "数据库帐号密码查找失败"
      });
    } else {
      findOne(app_basic, {
        appDomain: domain
      }, function(err, appInfos) {
        if (appInfos.appDbType !== "mongo") {
          return res.sendJson({
            status: "error",
            msg: "数据库未申请或者数据库类型不是mongoDB"
          });
        }
        var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoQuery.sh " + appInfos.appDbName + " " + data.dbUserName + " " + data.dbPassword + " " + queryString + " " + config.appDb.port;
        console.log(command);
        exec(command, function(err, stdout, stderr) {
          if (err) {
            log.error(err.toString());
            return res.sendJson({
              status: "error",
              msg: "查询数据库失败"
            });
          } else {
            var place = stdout.indexOf("1\n");
            if (place === -1) {
              stdout = "权限验证错误";
            } else {
              stdout = stdout.slice(place + 2, stdout.length - 4) + "\ndone";
            }
            return res.sendJson({
              status: "ok",
              output: stdout
            });
          }
        })
      });
    }
  })
}

exports.showTodo = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManageTodo", {
    layout: "layoutApp",
    email: req.session.email,
    nickName: req.session.nickName,
    url: url
  });
}

exports.loadTodoContent = function(req, res) {
  var domain = req.params.id || '';
  findOne(app_basic, { //find the app
    appDomain: domain
  }, function(err, data) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: "查询数据库错误"
      });
    } else if (!data || !data.todo) { //todos not exists
      return res.sendJson({
        status: "ok",
        content: {
          todos: []
        }
      });
    } else {
      var todos = data.todo;
      var userEmails = [],
          uhash = {};
      for (var i = 0, len = todos.length; i < len; ++i) { //find all the emails
        if (!uhash[todos[i].email]) {
          uhash[todos[i].email] = true;
          userEmails.push(todos[i].email);
        }
      }
      find(user, {
        email: {
          $in: userEmails
        }
      }, {
        email: 1,
        nickName: 1
      }, function(err, userInfos) {
        if (err) {
          log.error(err.toString());
          return res.sendJson({
            status: "error",
            msg: "查询数据库错误"
          });
        } else if (!userInfos || userInfos.length === 0) {
          return res.sendJson({
            status: "ok",
            content: {
              todos: []
            }
          });
        } else if (userInfos) { //get the nicks
          var emailToNick = {};
          for (var i = 0, len = userInfos.length; i < len; ++i) {
            emailToNick[userInfos[i].email] = userInfos[i].nickName;
          }
          for (var i = 0, len = todos.length; i < len; i++) {
            todos[i].nickName = emailToNick[todos[i].email];
          }
          todos.reverse();
          todos.sort(function(a, b) {
            return a.finished - b.finished
          });
          return res.sendJson({
            status: "ok",
            content: {
              todos: todos
            }
          });
        };
      })
    }
  })
}
exports.newTodo = function(req, res, next) {
  var domain = req.params.id || '',
      title = req.body.title || '';
  if (title === '') {
    return res.redirect("/application/manage/" + domain + "/todo");
  }
  update(app_basic, {
    appDomain: domain
  }, {
    $addToSet: {
      todo: {
        title: title,
        email: req.session.email,
        finished: 0
      }
    }
  }, function(err) {
    if (err) {
      log.error(err.toString());
      return next(err);
    } else {
      return res.redirect("/application/manage/" + domain + "/todo");
    }
  })
}
exports.finishTodo = function(req, res) {
  var domain = req.params.id || '',
      email = req.body.email || '',
      title = req.body.title || '';
  update(app_basic, {
    appDomain: domain,
    todo: {
      $elemMatch: {
        "email": email,
        "title": title
      }
    }
  }, {
    $set: {
      "todo.$.finished": 1
    }
  }, function(err) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error"
      });
    } else {
      return res.sendJson({
        status: "ok"
      });
    }
  })
}
exports.recoverTodo = function(req, res) {
  var domain = req.params.id || '',
      email = req.body.email || '',
      title = req.body.title || '';
  update(app_basic, {
    appDomain: domain,
    todo: {
      $elemMatch: {
        "email": email,
        "title": title
      }
    }
  }, {
    $set: {
      "todo.$.finished": 0
    }
  }, function(err) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error"
      });
    } else {
      return res.sendJson({
        status: "ok"
      });
    }
  })
}
exports.deleteTodo = function(req, res) {
  var domain = req.params.id || '',
      email = req.body.email || '',
      title = req.body.title || '';
  update(app_basic, {
    appDomain: domain,
  }, {
    $pull: {
      todo: {
        email: email,
        title: title
      }
    }
  }, function(err) {
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error"
      });
    } else {
      return res.sendJson({
        status: "ok"
      });
    }
  })
}
/***
*  显示package.json页面
*/
exports.showPackage = function(req, res){
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManagePackage", {
    layout: "layoutApp",
    email: req.session.email,
    nickName: req.session.nickName,
    url: url
  });   
}
/***
*  读取app的pakage.json文件
*/
exports.loadPackage = function(req, res){
  var domain = req.params.id||'';
  var packagePath = path.join(uploadDir, domain, 'package.json');
  var proxy = new EventProxy();
  //check if exists
  var checkPackage = function(){
    path.exists(packagePath, function(exist){
      if(!exist){
        proxy.removeAllListeners();
        return res.sendJson({status:"error", msg:"package.json not exists"})
      }
      proxy.fire('checked');
    })
  }
  //try to parse the json
  var parse = function(){
    fs.readFile(packagePath, 'utf8', function(err, file){
      if(err){
        log.warn(err.toString());
        return res.sendJson({status:"error", msg:"fail to read package.json"});
      }      
      var appPackage={};
      try{
        appPackage = JSON.parse(file);
      }catch(err){
        return res.sendJson({status:"error", msg:"parse package.json error: " + err.toString()});
      }
      return res.sendJson({status:"ok", appPackage : appPackage});
    })
  }
  proxy.once('checked', parse);
  checkPackage();
}

/***
 * 修改package.json
 */
exports.setPackage = function(req, res){
  var domain = req.params.id||'';
  var packagePath = path.join(uploadDir, domain, 'package.json');  
  var packageStr = req.body.packageStr||'';
  fs.writeFile(packagePath, packageStr, 'utf8', function(err){
    if(err){
      return res.sendJson({status:"error", msg:"write file error"})
    }
    return res.sendJson({status:"ok"})
  })
}
