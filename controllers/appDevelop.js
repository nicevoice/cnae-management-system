var config = require('../config')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , randomString = require('../lib/randomString')
  , db = config.db
  , log = config.logWithFile
  , users = db.collection(config.db_user)
  , app_mem = db.collection(config.db_app_mem)
  , app_basic = db.collection(config.db_app_basic)
  , app_todo = db.collection(config.db_app_todo)
  , records = db.collection(config.db_app_records)
  , EventProxy = require('EventProxy.js').EventProxy  
  , uploadDir = config.uploadDir
  , randomStringNum = require('../lib/randomString').getRandomStringNum;
  
  
  
  exports.vermng = function(req, res){
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	var domain = req.params.id||'';
	res.render("appManageCode", {layout:"layoutApp", domain:domain,url:url,
	nickName:req.session.nickName, email:req.session.email});
};
  
/***
 * 上传代码，gz zip格式
 * todo:zip格式偶尔出现过问题，控制上传大小
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.doUpload = function(req, res){
  console.log(req.session.email+" upload");
	var domain = req.params.id||'';
  var fields = req.form.fields, files = req.form.files;
	var filePath = files.upload ? files.upload.filename : null;
	//解压文件
	var type = files.upload.type;
	if(filePath){
		if(type==="application/zip"||type==="application/x-gzip"||type==="application/octet-stream"){
			if(type==="application/zip"||type==="application/octet-stream"){
				type = "zip";
			}else{
				type= "gz";
			}
      var tempDir = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"temp",
			    savePath = uploadDir+'/'+domain +'/'; 
			fs.mkdir(tempDir+"/"+domain, '777', function(err){
          console.log("mkdir");
          if (err&&err.errno !== 17) {
              console.log(err.toString());
            }
              var unCompress = "";
              if (type === "gz") {
                unCompress = 'tar -xf ' + files.upload.path + ' -C ' + tempDir + '/' + domain;
              }
              else {
                unCompress = 'unzip ' + files.upload.path + ' -d ' + tempDir + '/' + domain;
              }
              exec(unCompress, function(err, stdout, stderr){
                if (err) {
                  console.log(err.toString());
                  exec("rm -rf "+files.upload.path, function(err){
                    if(err){
                      console.log(err.toString());
                    }
                  });
                  return res.render("error", {
                    message: "上传失败,请稍后再试"
                  });
                }
                else {
                  console.log("unCompress");
                  fs.readdir(tempDir + '/' + domain, function(err, files){
                    if (err) {
                      console.log(err.toString());
                      exec("rm -rf "+files.upload.path, function(err){
                        if(err){
                          console.log(err.toString());
                        }
                      });
                      exec("rm -rf " + tempDir + '/' + domain, function(err){
                        if(err){
                          console.log(err.toString());
                        }
                      });
                      return res.render("error", {
                        message: "上传失败,请稍后再试"
                      });
                    }
                    else {
                      fs.mkdir(savePath, '777', function(err){
                        var move = "";
                        if (err && err.errno !== 17) {
                          console.log(err.toString());
                          exec("rm -rf "+files.upload.path, function(err){
                            if(err){
                              console.log(err.toString());
                            }
                          });
                          exec("rm -rf " + tempDir + '/' + domain, function(err){
                            if(err){
                              console.log(err.toString());
                            }
                          });
                          return res.render("error", {
                            message: "上传失败,请稍后再试"
                          });
                        }
                        else {
                          var moveEvent = new EventProxy();
                          moveEvent.on("getStat", function(isDir){
                            if(isDir){
                              move = "cp -rf " + tempDir + '/' + domain + "/" + files[0] + "/* " + savePath;
                            }else{
                              move = "cp -rf " + tempDir + '/' + domain + "/* " + savePath;
                            }
                          exec(move, function(err){
                            if (err) {
                              console.log(err.toString());
                              exec("rm -rf "+files.upload.path, function(err){
                                if(err){
                                  console.log(err.toString());
                                }
                              });
                              exec("rm -rf " + tempDir + '/' + domain, function(err){
                                if (err) {
                                  console.log(err.toString());
                                }
                              });
                              return res.render("error", {
                                message: "上传失败,请稍后再试"
                              });
                            }
                            else {
                              exec("rm -rf "+files.upload.path, function(err){
                                if(err){
                                  console.log(err.toString());
                                }
                              });
                              exec("rm -rf " + tempDir + '/' + domain, function(err){
                                if(err){
                                  console.log(err.toString());
                                }
                              });
                              var sumManage = req.url.slice(0, req.url.lastIndexOf('/'));
                              sumManage += '/sum';
                              return res.redirect(sumManage);
                            }
                          });
                          });
                          
                          if (files.length === 1) {
                            fs.stat(tempDir + '/' + domain + "/" + files[0], function(err, stat){ //如果只有一个文件夹
                              if(err){
                                console.log(err.toString());
                                moveEvent.unbind();
                                return res.render("error", {message:"上传失败，请稍后再试"});
                              }else{
                                moveEvent.fire("getStat", stat.isDirectory());
                              }
                            })
                          }
                          else {
                            moveEvent.fire("getStat", false);
                          }
                        }
                      })
                    }
                  })
                }
              })
						records.save({appDomain:domain.toString(), email:req.session.email.toString(),
						action:"上传代码", recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
					});
		}else{
			return res.render("error", {message:"请上传正确的格式"});
		}
	}else{
			return res.render("error", {message:"请选择一个文件上传"});
	}
} 	

exports.gitClone = function(req, res){
  console.log(req.session.email+ " "+ req.params.id+" git clone");
  var tempDirLast = randomStringNum(15),
      tempDir = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"temp",
      gitClone = "git clone "+ req.body.gitUrl + " "+ tempDir+"/"+tempDirLast,
      domain = req.params.id||'',
      savePath = uploadDir+'/'+domain +'/',
      move = "cp -rf "+tempDir+"/"+tempDirLast + "/* "+ savePath; 
      exec(gitClone, function(err, gitStdout, gitStderr){
        if(err){
          console.log(err.toString());
          exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
          return res.sendJson({status:"error", msg:"请使用Git Read-Only方式获取代码"});
        }else{
           fs.mkdir(savePath, '777', function(err){
             console.log("mkdir");
             if(err && err.errno !== 17){
               console.log(err.toString());
               exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
               return res.sendJson({status:"error", msg:"执行错误，请稍后再试"});
             }else{
               exec(move, function(err){
                 console.log("move");
                 if(err){
                   console.log(err.toString());
                   return res.sendJson({status:"error", msg:err.toString()});
                 }
                 else{
                   exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
                   return res.sendJson({status:"ok",msg:"成功获取"});
                 }
               })
             }
           })
        }
      })
}

exports.gitPull = function(req, res){
  console.log(req.session.email+ " "+ req.params.id+" git pull");
  var domain = req.params.id|| '',
      pull = "git pull",
      cwd = process.cwd(),
      savePath = uploadDir+'/'+domain +'/';
  try{
		process.chdir(savePath);
	}catch(err){
    console.log(err.toString());
		return res.sendJson( {status:"error", msg:"拉取代码失败，请稍后再试"});
	}
  exec(pull, function(err, gitStdout, gitStderr){
    try{
			process.chdir(cwd);
		}catch(err){
			console.log(err.toString());
		}
    if(err){
      console.log(err.toString());
		  return res.sendJson( {status:"error", msg:"拉取代码失败，请稍后再试"});
    }else{
      return res.sendJson({status:"ok", msg:gitStdout});
    }
  })
}
/***
 * 
 * @param {} req
 * @param {} res
 */
exports.doDownload = function(req, res){
  console.log(req.session.email+ " "+ req.params.id+" download");
	var domain = req.params.id||'';
	var cwd = process.cwd();
	var now = new Date();
	var name = domain + "_" + now.getTime() + ".zip";
	var saveName = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"public/download/"+name;
	try{
		process.chdir(uploadDir);
	}catch(err){
		return res.sendJson( {status:"error", msg:"修改工作目录失败"});
	}
	var compress = "zip -r "+ saveName + " "+domain;
	exec(compress, function(err, stdout, stderr){
		try{
			process.chdir(cwd);
		}catch(err){
			console.log("chdir error");
		}
		if(err){
			console.log(err.toString());
			return res.sendJson( {status:"error", msg:"压缩失败"});		
		}else{
			return res.sendJson( {status:"ok", url:"/download/"+name});
		}	
	})
}

exports.downloading = function(req, res){
	var name = req.params.id||'',
		domain = name.slice(0, name.lastIndexOf("_"));
	app_mem.findOne({email:req.session.email, appDomain:domain}, function(err, data){
		if(err){
			return res.render("error", {msg:"查询数据库出错，请稍后再试"});
		}else{
			if(data.role&&data.active && data.role<=2 && data.active===1){
				return res.render("/download/"+name+".zip");
			}else{
				return res.render("error", {msg:"不够权限下载这个应用"});
			}
		}
	})
}
/***
 * 上传图片
 * todo：上传大小限制
 * @param {} req
 * @param {} res
 */
exports.doUploadImg = function(req, res){
	var domain = req.params.id||'';
    var fields = req.form.fields, files = req.form.files;
	var filePath = files.upload ? files.upload.filename : null;	
	if(filePath){
		if(fiiles.upload.type.indexOf("image")!==-1){
			var savePath = uploadDir+'/'+domain +'/'+ fields + "/"+files.upload.name;
			fs.rename(files.upload.path, savePath, function(err){
				if(err){
					console.log(err);
					return res.sendJson( {done:false});
				}else{
					return res.sendJson( {done:true});
				}
			});
		}
	}
}

exports.showMongo = function(req, res){
	var domain = req.params.id||'';
		url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	app_basic.findOne({appDomain:domain},function(err, data){
		if(err){
			console.log(err);
			res.render("error", {msg:"数据库错误，请稍后再试"});
		}else{
			users.findOne({email:req.session.email}, function(err, user){
				if(err){
					console.log(err);
					res.render("error", {msg:"数据库错误，请稍后再试"});
				}
				res.render("appManageMongo",{layout:"layoutApp", url:url, domain:domain,dbType:data.appDbType,
				nickName:req.session.nickName, email:req.session.email, dbUserName:user.dbUserName, dbPassword:user.dbPassword,
				dbName:data.appDbName});
			});
		}
	})
}
exports.createMongo = function(req, res){
  console.log(req.session.email+ " "+ req.params.id+" create mongo");
	var domain = req.params.id||'',
		url = req.url,
		email = req.session.email;
	url = url.slice(0, url.lastIndexOf('/'));
	users.findOne({email:email},function(err, data){
		if(err){
			console.log(err);
			return res.render("error", {message:"数据库错误，请稍后再试"});
		}else{
			if(data.dbType){	//如果已经创建过数据库
				return res.render("error", {message:"已经创建数据库"});
			}else{
				var dbName = randomStringNum(12);
				var command = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"shells/mongoAllocator.sh "+
				dbName + " "+ data.dbUserName + " " + data.dbPassword;
				console.log(command);
				exec(command, function(err, stdout, stderr){//执行shell脚本，给用户授权对应数据库
					if(err){
						console.log(err.toString());
						return res.render("error", {message:"执行错误，请稍后再试"});
					}else{
						app_basic.update({appDomain:domain}, {$set:{appDbType:"mongo", appDbName:dbName}}, function(err){//更新应用表
							if(err){
								console.log(err.toString());
								return res.render("error", {message:"执行错误，请稍后再试"});
							}else{
								return res.redirect(url+"/mongo");
							}
						})
					}
				})
			}
		}
	})
}

checkQueryString = function(queryString){
  if(queryString.indexOf("db.")!==0 && queryString.indexOf("show")!==0){
    return false;
  }else{
    if(queryString.indexOf("db.addUser")===0||
       queryString.indexOf("db.auth")===0||
       queryString.indexOf("db.removeUser")===0||
       queryString.indexOf("db.eval")===0||
       queryString.indexOf("db.dropDatabase")===0||
       queryString.indexOf("db.shoutdownServer")===0||
       queryString.indexOf("db.copyDatabase")===0||
       queryString.indexOf("db.cloneDatabse")===0){
         return false;
       }else{
         return true;
       }
  }
}

exports.queryMongo = function(req, res){
	var domain = req.params.id||'',
		queryString = req.body.queryString.trim()||'';
  console.log(req.session.email+ " "+ domain + " query mongo "+queryString);
	if(!checkQueryString(queryString)){
		return res.sendJson( {status:"error", msg:"该操作不被允许"});
	}
		queryString = "\""+queryString+"\"";
	users.findOne({email:req.session.email},function(err, data){//查找db帐号密码
		if(err){
			console.log(err.toString());
			return res.sendJson( {status:"error", msg:"数据库帐号密码查找失败"});		
		}else{
			app_basic.findOne({appDomain:domain},function(err, appInfos){
				if(appInfos.appDbType!=="mongo"){
					return res.sendJson( {status:"error", msg:"数据库未申请或者不是mongoDB"});
				}
				var command = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"shells/mongoQuery.sh "+
					appInfos.appDbName +" "+ data.dbUserName + " " + data.dbPassword +" "+ queryString;
				console.log(command);
				exec(command, function(err, stdout, stderr){
					if(err){
						console.log(err.toString());
						return res.sendJson( {status:"error", msg:"查询数据库失败"});
					}else{
						var place = stdout.indexOf("1\n");
						if(place === -1){
							stdout = "权限验证错误";
						}else{
							stdout = stdout.slice(place+2, stdout.length-4) + "\ndone";
						}
						
						return res.sendJson( {status:"ok", output:stdout});
					}
				})
			});
		}
	})
}

exports.showTodo = function(req, res){
  var domain = req.params.id || '',
  		url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
  app_todo.find({
    appDomain: domain
  },{sort:[['finished', 1]]}).toArray(function(err, data){
    if (err) {
      console.log(err.toString());
      return res.render("error", {
        message: "查询数据库错误，请稍后再试"
      });
    }
    else {
      res.render("appManageTodo", {
        layout: "layoutApp",
        todos: data,
        domain: domain,
        email: req.session.email,
        nickName: req.session.nickName,
        url:url
      });
    }
  })
}

exports.newTodo = function(req, res){
  var domain = req.params.id || '',
      title = req.body.title;
  app_todo.save({title:title, email:req.session.email, appDomain:domain, finished:0}, function(err){
    if (err) {
      console.log(err.toString());
      return res.render("error", {
        message: "查询数据库错误，请稍后再试"
      });
    }else{
      return res.redirect("/application/manage/"+domain+"/todo");
    }
  })
}
exports.finishTodo = function(req, res){
  var domain = req.params.id|| '',
      _id = app_todo.id(req.body._id);
  app_todo.update({_id:_id}, {$set:{finished:1}}, function(err){
    if(err){
      return res.sendJson({status:"error"});
    }else{
      console.log(_id);
      return res.sendJson({status:"ok"});
    }
  })
}
exports.recoverTodo = function(req, res){
  var domain = req.params.id|| '',
      _id = app_todo.id(req.body._id);
  app_todo.update({_id:_id}, {$set:{finished:0}}, function(err){
    if(err){
      return res.sendJson({status:"error"});
    }else{
      return res.sendJson({status:"ok"});
    }
  })
}
exports.deleteTodo = function(req, res){
  var domain = req.params.id|| '',
      _id = app_todo.id(req.body._id);
  app_todo.remove({_id:_id}, function(err){
    if(err){
      return res.sendJson({status:"error"});
    }else{
      return res.sendJson({status:"ok"});
    }
  })
}