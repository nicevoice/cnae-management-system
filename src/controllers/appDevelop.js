var config = require('../config')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , EventProxy = require('EventProxy.js').EventProxy  
  //models
  , model = require('../models/index')
  , collectionNames = require('../config').dbInfo.collections
  , user = collectionNames.user
  , app_mem = collectionNames.app_member
  , app_basic = collectionNames.app_basic
  , app_record = collectionNames.app_record
  , find = model.find
  , findOne = model.findOne
  , update = model.update
  , insert = model.insert
  
  , log = config.logWithFile
  , uploadDir = config.uploadDir
  , randomStringNum = require('../lib/utils').getRandomStringNum;
  
  
  
exports.vermng = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
    return res.render("appManageCode", {
      layout : "layoutApp",
      url : url,
      nickName : req.session.nickName,
      email : req.session.email
    });
};

/***
 * 上传代码，gz zip格式
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.doUpload = function(req, res) {
  var domain = req.params.id || '';
  var fields = req.form.fields, files = req.form.files;
  var filePath = files.upload ? files.upload.filename : null;
  //解压文件
  if(filePath) {
    var type = files.upload.type, path = files.upload.path;
    if(type === "application/zip" || type === "application/x-gzip" || type === "application/octet-stream") {
      if(type === "application/zip" || type === "application/octet-stream") {
        type = "zip";
      } else {
        type = "gz";
      }
      var tempDir = config.tempDir, savePath = uploadDir + '/' + domain + '/';
      fs.mkdir(tempDir + "/" + domain, '777', function(err) {
        if(err && err.errno !== 17) {
          log.error(err.toString());
          return res.render("error", {
            message : "创建文件夹失败。请稍后再试。"
          });
        }
        var unCompress = "";
        if(type === "gz") {
          unCompress = 'tar -xf ' + path + ' -C ' + tempDir + '/' + domain;
        } else {
          unCompress = 'unzip ' + path + ' -d ' + tempDir + '/' + domain;
        }
        exec(unCompress, function(err, stdout, stderr) {
          if(err) {
            log.error(err.toString());
            exec("rm -rf " + path, function(err) {
              if(err) {
                log.error(err.toString());
              }
            });
            exec("rm -rf " + tempDir + '/' + domain, function(err) {
                  if(err) {
                    log.error(err.toString());
                  }
            });
            return res.render("error", {
              message : "上传失败,请稍后再试"
            });
          } else {
            fs.readdir(tempDir + '/' + domain, function(err, files) {
              if(err) {
                log.error(err.toString());
                exec("rm -rf " + path, function(err) {
                  if(err) {
                    log.error(err.toString());
                  }
                });
                exec("rm -rf " + tempDir + '/' + domain, function(err) {
                  if(err) {
                    log.error(err.toString());
                  }
                });
                return res.render("error", {
                  message : "上传失败,请稍后再试"
                });
              } else {
                fs.mkdir(savePath, '777', function(err) {
                  var move = "";
                  if(err && err.errno !== 17) {
                    log.error(err.toString());
                    exec("rm -rf " + path, function(err) {
                      if(err) {
                        log.error(err.toString());
                      }
                    });
                    exec("rm -rf " + tempDir + '/' + domain, function(err) {
                      if(err) {
                        log.error(err.toString());
                      }
                    });
                    return res.render("error", {
                      message : "上传失败,请稍后再试"
                    });
                  } else {
                    var moveEvent = new EventProxy();
                    moveEvent.on("getStat", function(isDir) {
                      if(isDir) {
                        move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + domain + "/" + files[0] + " " + savePath;
                      } else {
                        //通过执行cpall脚本来进行全文件复制
                        move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + domain + " " + savePath;
                      }
                      exec(move, function(err) {
                      	if(err){
                      		log.error(err.toString());
                        }
                        
                          exec("rm -rf " + path, function(err) {
                            if(err) {
                              log.error(err.toString());
                            }
                          });
                          exec("rm -rf " + tempDir + '/' + domain, function(err) {
                            if(err) {
                              log.error(err.toString());
                            }
                          });
                          var sumManage = req.url.slice(0, req.url.lastIndexOf('/'));
                          sumManage += '/sum';
                          return res.redirect(sumManage);
                        
                      });
                    });
                    if(files.length === 1) {
                      fs.stat(tempDir + '/' + domain + "/" + files[0], function(err, stat) {//如果只有一个文件夹
                        if(err) {
                          log.error(err.toString());
                          moveEvent.unbind();
                          return res.render("error", {
                            message : "上传失败，请稍后再试"
                          });
                        } else {
                          moveEvent.fire("getStat", stat.isDirectory());
                        }
                      })
                    } else {
                      moveEvent.fire("getStat", false);
                    }
                  }
                })
              }
            })
          }
        })
        insert(app_record, {
          appDomain : domain.toString(),
          email : req.session.email.toString(),
          action : "上传代码",
          recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
        }, function() {
        });
      });
    } else {
      return res.render("error", {
        message : "请上传正确的格式"
      });
    }
  } else {
    return res.render("error", {
      message : "请选择一个文件上传"
    });
  }
}

exports.gitClone = function(req, res) {
  var gitUrl = req.body.gitUrl||'';
  var matchs = gitUrl.match(config.regGit);
  gitUrl = matchs?matchs[0]:null;
  if(!gitUrl){
      return res.sendJson({
          status:'error',
          msg:'请输入正确的git-url'
      })
  }
  var tempDirLast = randomStringNum(15), tempDir = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "temp", gitClone = "git clone " + gitUrl + " " + tempDir + "/" + tempDirLast, domain = req.params.id || '', savePath = uploadDir + '/' + domain + '/', move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + tempDirLast + " " + savePath;
  exec(gitClone, function(err, gitStdout, gitStderr) {
    if(err) {
      log.error(err.toString());
      exec("rm -rf " + tempDir + "/" + tempDirLast, function() {
      });
      return res.sendJson({
        status : "error",
        msg : "请使用Git Read-Only方式获取代码"
      });
    } else {
      fs.mkdir(savePath, '777', function(err) {
        if(err && err.errno !== 17) {
          log.error(err.toString());
          exec("rm -rf " + tempDir + "/" + tempDirLast, function() {
          });
          return res.sendJson({
            status : "error",
            msg : "执行错误，请稍后再试"
          });
        } else {
          exec(move, function(err) {
            if(err && err.toString().indexOf("no matches found") === -1) {
              log.error(err.toString());
              return res.sendJson({
                status : "error",
                msg : err.toString()
              });
            } else {
              exec("rm -rf " + tempDir + "/" + tempDirLast, function() {
              });
              return res.sendJson({
                status : "ok",
                msg : "成功获取"
              });
            }
          })
        }
      })
    }
  })
}

exports.gitPull = function(req, res) {
  var domain = req.params.id || '', pull = "git pull", cwd = process.cwd(), savePath = uploadDir + '/' + domain + '/';
  try {
    process.chdir(savePath);
  } catch(err) {
    log.error(err.toString());
    return res.sendJson({
      status : "error",
      msg : "拉取代码失败，请稍后再试"
    });
  }
  exec(pull, function(err, gitStdout, gitStderr) {
    try {
      process.chdir(cwd);
    } catch(err) {
      log.error(err.toString());
    }
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : err.toString()
      });
    } else {
      return res.sendJson({
        status : "ok",
        msg : gitStdout
      });
    }
  })
}
/***
 *
 * @param {} req
 * @param {} res
 */
exports.doDownload = function(req, res) {
  var domain = req.params.id || '';
  var cwd = process.cwd();
  var now = new Date();
  var name = domain + "_" + now.getTime() + ".zip";
  var saveName = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "public/download/" + name;
  try {
    process.chdir(uploadDir);
  } catch(err) {
    log.error(err.toString());
    return res.sendJson({
      status : "error",
      msg : "修改工作目录失败"
    });
  }
  var compress = "zip -r " + saveName + " " + domain;
  exec(compress, function(err, stdout, stderr) {
    try {
      process.chdir(cwd);
    } catch(err) {
      log.error(err.toString());
    }
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "压缩失败"
      });
    } else {
      return res.sendJson({
        status : "ok",
        url : "/download/" + name
      });
    }
  })
}

exports.downloading = function(req, res) {
  var name = req.params.id || '', domain = name.slice(0, name.lastIndexOf("_"));
  findOne(app_mem, {
    email : req.session.email,
    appDomain : domain
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      return res.render("error", {
        msg : "查询数据库出错，请稍后再试"
      });
    } else {
      if(data.role && data.active && data.role <= 2 && data.active === 1) {
        return res.render("/download/" + name + ".zip");
      } else {
        return res.render("error", {
          msg : "没有权限下载这个应用"
        });
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
  try {
    var domain = req.params.id || "", fields = req.form.fields, files = req.form.files, filePath = files.upload ? files.upload.filename : null, dirPath = req.body.dirPath || "", savePath = require('path').join(uploadDir, domain, dirPath, files.upload.name);
  } catch(err) {
    log.error(err.toString());
    return res.sendJson({
      error : "true",
      msg : "invalid param"
    });
  }

  if(!filePath)
    return res.sendJson({
      error : "true",
      msg : "invalid filePath"
    });
  fs.rename(files.upload.path, savePath, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        error : "true",
        msg : "rename file error"
      });
    }
    return res.sendJson({
      error : "false",
      msg : "succeed"
    });
  });
}
exports.upload = function(req, res, callback){
  try {
    var domain = req.params.id || "", fields = req.form.fields, files = req.form.files, filePath = files.upload ? files.upload.filename : null, dirPath = req.body.dirPath || "", savePath = require('path').join(uploadDir, domain, dirPath, files.upload.name);
  } catch(err) {
    log.error(err.toString());
  }  
}
/***
 * 进行npm install 操作
 * @param {Object} req
 * @param {Object} res
 */
exports.npmInstall = function(req, res) {
  var npmName = req.body.npmName||'';
  var items = npmName.match(config.regNpm);
  npmName = items ? items[0] : null;
  if(!npmName){
      return res.sendJson({
          status:'error',
          msg:'请输入正确的模块名'
      })
  } 
  var domain = req.params.id || '', install = "npm install " + npmName, cwd = process.cwd();
  try {
    process.chdir(uploadDir + '/' + domain);
  } catch(err) {
    log.error(err.toString());
    return res.sendJson({
      status : "error",
      msg : "安装模块失败，请稍后再试"
    });
  }
  exec(install, function(err, npmStdout, npmStderr) {
    try {
      process.chdir(cwd);
    } catch(err) {
      log.error(err.toString());
    }
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : err.toString()
      });
    } else {
      return res.sendJson({
        status : "ok",
        msg : npmStdout
      });
    }
  });
}
exports.showMongo = function(req, res) {
  url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
    return res.render("appManageMongo", {
      layout : "layoutApp",
      url : url,
      nickName : req.session.nickName,
      email : req.session.email
    });
}

exports.loadMongoContent = function(req, res) {
  var domain = req.params.id || '';
  findOne(app_basic, {
    appDomain : domain
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "数据库查询错误"
      });
    } else {
      findOne(user, {
        email : req.session.email
      }, function(err, user) {
        if(err) {
          log.error(err.toString());
          return res.sendJson({
            status : "error",
            msg : "数据库查询错误"
          });
        }
        return res.sendJson({
          status : 'ok',
          content : {
            dbType : data.appDbType,
            dbUserName : user.dbUserName,
            dbPassword : user.dbPassword,
            dbName : data.appDbName,
            appDb : config.appDb
          }
        });
      });
    }
  })
}
exports.createMongo = function(req, res) {
  var domain = req.params.id || '', url = req.url, email = req.session.email;
  url = url.slice(0, url.lastIndexOf('/'));
  findOne(app_basic, {
    appDomain : domain,
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      return res.render("error", {
        message : "数据库错误，请稍后再试"
      });
    } else {
      
      if(data.appDbType) {//如果已经创建过数据库
        return res.render("error", {
          message : "已经创建数据库"
        });
      } else {
      	var proxy = new EventProxy();
      	proxy.once('dbUser', function(dbUser){
      	if(dbUser===false){
      		return res.render("error", {message:"数据库查询错误，请稍后再试"});
      	}
        var dbName = randomStringNum(12);
        var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoAllocator.sh " + dbName + " " + dbUser.dbUserName + " " + dbUser.dbPassword;
        exec(command, function(err, stdout, stderr) {//执行shell脚本，给用户授权对应数据库
          if(err) {
            log.error(err.toString());
            return res.render("error", {
              message : "执行错误，请稍后再试"
            });
          } else {
            update(app_basic, {
              appDomain : domain
            }, {
              $set : {
                appDbType : "mongo",
                appDbName : dbName
              }
            }, function(err) {//更新应用表
              if(err) {
                log.error(err.toString());
                return res.render("error", {
                  message : "执行错误，请稍后再试"
                });
              } else {
                return res.redirect(url + "/mongo");
              }
            })
          }
        })
        });
        findOne(user, {email:req.session.email}, {dbUserName:1, dbPassword:1}, function(err, data){
        	if(err){
        		log.error(err.toString());
        		proxy.fire('dbUser',false);
        	}else{
        		proxy.fire('dbUser', data);
        	}
        })
      }
    }
  })
}
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

exports.queryMongo = function(req, res) {
  var domain = req.params.id || '', queryString = req.body.queryString.trim() || '';
  if(!checkQueryString(queryString)) {
    return res.sendJson({
      status : "error",
      msg : "该操作不被允许"
    });
  }
  queryString = "\"" + queryString + "\"";
  findOne(user, {
    email : req.session.email
  }, function(err, data) {//查找db帐号密码
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "数据库帐号密码查找失败"
      });
    } else {
      findOne(app_basic, {
        appDomain : domain
      }, function(err, appInfos) {
        if(appInfos.appDbType !== "mongo") {
          return res.sendJson({
            status : "error",
            msg : "数据库未申请或者数据库类型不是mongoDB"
          });
        }
        var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoQuery.sh " + appInfos.appDbName + " " + data.dbUserName + " " + data.dbPassword + " " + queryString;
        exec(command, function(err, stdout, stderr) {
          if(err) {
            log.error(err.toString());
            return res.sendJson({
              status : "error",
              msg : "查询数据库失败"
            });
          } else {
            var place = stdout.indexOf("1\n");
            if(place === -1) {
              stdout = "权限验证错误";
            } else {
              stdout = stdout.slice(place + 2, stdout.length - 4) + "\ndone";
            }
            return res.sendJson({
              status : "ok",
              output : stdout
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
      layout : "layoutApp",
      email : req.session.email,
      nickName : req.session.nickName,
      url : url
    });
}

exports.loadTodoContent = function(req, res) {
  var domain = req.params.id || '';
  findOne(app_basic, {
    appDomain : domain
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "查询数据库错误"
      });
    } else if(!data || !data.todo) {
      return res.sendJson({
        status : "ok",
        content : {
          todos : []
        }
      });
    } else {
      var todos = data.todo;
      var userEmails = [], uhash = {};
      for(var i = 0, len = todos.length; i < len; ++i) {
        if(!uhash[todos[i].email]) {
          uhash[todos[i].email] = true;
          userEmails.push(todos[i].email);
        }
      }
      find(user, {
        email : {
          $in : userEmails
        }
      }, {
        email : 1,
        nickName : 1
      }, function(err, userInfos) {
        if(err) {
          log.error(err.toString());
          return res.sendJson({
            status : "error",
            msg : "查询数据库错误"
          });
        } else if(!userInfos || userInfos.length === 0) {
          return res.sendJson({
            status : "ok",
            content : {
              todos : []
            }
          });
        } else if(userInfos) {
          var emailToNick = {};
          for(var i = 0, len = userInfos.length; i < len; ++i) {
            emailToNick[userInfos[i].email] = userInfos[i].nickName;
          }
          for(var i = 0, len = todos.length; i < len; i++) {
            todos[i].nickName = emailToNick[todos[i].email];
          }
          todos.reverse();
          todos.sort(function(a, b) {
            return a.finished - b.finished
          });
          return res.sendJson({
            status : "ok",
            content : {
              todos : todos
            }
          });
        }
        ;
      })
    }
  })
}
exports.newTodo = function(req, res) {
  var domain = req.params.id || '', title = req.body.title || '';
  if(title === '') {
    return res.redirect("/application/manage/" + domain + "/todo");
  }
  update(app_basic, {
    appDomain : domain
  }, {
    $addToSet : {
      todo : {
        title : title,
        email : req.session.email,
        finished : 0
      }
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.render("error", {
        message : "查询数据库错误，请稍后再试"
      });
    } else {
      return res.redirect("/application/manage/" + domain + "/todo");
    }
  })
}
exports.finishTodo = function(req, res) {
  var domain = req.params.id || '', email = req.body.email || '', title = req.body.title || '';
  update(app_basic, {
    appDomain : domain,
    todo : {
      $elemMatch : {
        "email" : email,
        "title" : title
      }
    }
  }, {
    $set : {
      "todo.$.finished" : 1
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error"
      });
    } else {
      return res.sendJson({
        status : "ok"
      });
    }
  })
}
exports.recoverTodo = function(req, res) {
  var domain = req.params.id || '', email = req.body.email || '', title = req.body.title || '';
  update(app_basic, {
    appDomain : domain,
    todo : {
      $elemMatch : {
        "email" : email,
        "title" : title
      }
    }
  }, {
    $set : {
      "todo.$.finished" : 0
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error"
      });
    } else {
      return res.sendJson({
        status : "ok"
      });
    }
  })
}
exports.deleteTodo = function(req, res) {
  var domain = req.params.id || '', email = req.body.email || '', title = req.body.title || '';
  update(app_basic, {
    appDomain : domain,
  }, {
    $pull : {
      todo : {
        email : email,
        title : title
      }
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error"
      });
    } else {
      return res.sendJson({
        status : "ok"
      });
    }
  })
}

