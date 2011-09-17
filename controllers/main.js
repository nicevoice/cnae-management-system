var config = require('../config')
  , log = config.logWithFile
  , model = require('../models/index')
  , users = model.users
  , app_mem = model.app_mem
  , app_basic = model.app_basic
  , app_todo = model.app_todo
  , records = model.records
  , urlMoudle = require('url')
  , EventProxy = require('EventProxy.js').EventProxy
  , fs = require('fs')
  , uploadDir = config.uploadDir
  , onOff = require('../lib/socket').onOff
  , exec  = require('child_process').exec;
  
  /***
   * 临时用来显示文档中心。（暂时不存在）
   * @param {} req
   * @param {} res
   */
  exports.showDoc = function(req, res){
  	 res.render("doc", {layout:"layoutMain", nickName:req.session.nickName, email:req.session.email});
  }

  /***
   * 显示主页面
   * @param {} req
   * @param {} res
   */
 exports.show = function(req, res){
 	//查找数据库
 	var getAppEvent = new EventProxy();
 	//当获取到自己的应用和参与的应用之后，才进行页面跳转
 	getAppEvent.assign("getOwns","getOthers",function(owns, others){
 		res.render("main", {layout:"layoutMain",ownApps:owns, otherApps:others, nickName:req.session.nickName, email:req.session.email});
 	});
 	//从app_mem中查找自己的应用
 	app_mem.find({email:req.session.email.toString(), 
 	role:0}, {appDomain:1, appName:1}).toArray(function(err, data){
 		if(err){
 			log.error(err);
 			getAppEvent.unbind();
 			return res.render("error", "数据库查询出错，请稍后再试");
    	}else{
    		getAppEvent.fire("getOwns", data);
    	}
    });
    //从app_mem中查找参与的应用
    app_mem.find({email:req.session.email.toString(),
    role:{$ne:0}}, {appDomain:1, appName:1, active:1}).toArray(function(err, data){
    	if(err){
    		log.error(err);
    		getAppEvent.unbind();
 			return res.render("error", "数据库查询出错，请稍后再试");
    	}else{
    		getAppEvent.fire("getOthers", data);
    	}
    });
 }
 /***
  * 创建新应用
  * @param {} req
  * @param {} res
  * @return {}
  */
 exports.createApp = function(req, res){
  var newAppDomain = req.body.appDomain || '';
 	var newAppName = req.body.appName || '';
 	var newAppDes = req.body.appDes || '';
 	var checkRepetition = new EventProxy();
  if(!newAppDomain){
   return res.render("error", {message:"应用必须有子域名"}); 
  }
  if(!newAppName){
 	return res.render("error", {message:"必须有应用名称"});
 }
 if(newAppName.length>10){
   newAppName = newAppName.slice(0, 10);
 }
 if(newAppDes.length>100){
   newAppDes = newAppDes.slice(0, 100);
 }
  var regDomain = /^[a-z][a-z0-9_]{3,17}$/;
  if(!regDomain.exec(newAppDomain))
		return res.render("error", {message:"子域名格式错误"});

		//检查域名是否重复，用户创建的应用数目是否达到上限
  checkRepetition.assign("checkDomain", "checkNumbers", function(goodDomain, checkNumbers){
 		if(!goodDomain)
 			return res.render("error", {message:"该域名已经被占用"});
 		if(!checkNumbers)
 			return res.render("error", {message:"创建的应用数目已经达到上限"});
 		else{
 			var createAppEvent = new EventProxy();
 			createAppEvent.assign("savedBasic", "savedMem", "saveRecord", function(){
 				var saveDir = uploadDir+"/"+newAppDomain;
 				var initFile = __dirname.slice(0, __dirname.lastIndexOf('/')+1)+"init.tar.gz";
				fs.mkdir(saveDir, '777', function(err){
					console.log("mkdir");
					if(err){
						console.log("创建应用文件夹失败");
					}else{
						var initFile = __dirname.slice(0, __dirname.lastIndexOf('/')+1)+"init.tar.gz";
						console.log(initFile);
						console.log(saveDir);
						exec('tar -xf '+ initFile + ' -C '+ saveDir, function(err){
						if(err){
							console.log("初始文件夹失败:"+err.toString());
						}
					}); 
				}
			});
 				res.redirect("/application");
 			})
 			//执行插入
      var now = new Date().getTime();
 			app_basic.save({appDomain:newAppDomain.toString(), appName:newAppName.toString(),
 			appDes:newAppDes.toString(), appState:0, appCreateDate:now}, function(err){
 				if(err){
 					log.error(err);
 					createAppEvent.unbind();
 					return res.render("error", {message:"创建应用失败，请稍后再试"});
 				}
 				else{
 					createAppEvent.fire("savedBasic", true);
 				}
 			});
 			app_mem.save({appDomain:newAppDomain.toString(), appName:newAppName.toString(),
 			email:req.session.email.toString(), role:0, active:1,joinTime:new Date().getTime()}, function(err){
 				if(err){
 					log.error(err);
 					createAppEvent.unbind();
 					return res.render("error", {message:"创建应用失败，请稍后再试"});
 				}
 				else{
 					createAppEvent.fire("savedMem", true);
 				}
 			});
 			records.save({appDomain:newAppDomain.toString(), email:req.session.email,
 			action:"创建应用", recordTime:now}, function(err){
 				if(err){
 					log.error(err);
 				}else{
 					createAppEvent.fire("saveRecord", true);
 				}
 			})
 			
 		}
 	})
 	app_mem.findOne({appDomain:newAppDomain.toString()},function(err, item){
 		if(err){
 			log.error(err);
 			checkRepetition.unbind();
 			return res.render("error", {message:"创建应用失败，请稍后再试"});
 		}
 		else{
 			if(item){
 				checkRepetition.fire("checkDomain", false);
 			}
 			checkRepetition.fire("checkDomain", true);
 		}
 	});
 var isAdmin = false;
	for(var i=0, len=config.admins.length; i<len; ++i){
		if(req.session.email === config.admins[i]){
			isAdmin = true;
			break;
		}
	}
  if (isAdmin) {
    checkRepetition.fire("checkNumbers", true);
  }
  else {
    app_mem.count({
      email: req.session.email,
      role: 0
    }, function(err, data){
      console.log("应用数目:" + data);
      if (err) {
        log.error(err);
        checkRepetition.unbind();
        return res.render("error", {
          message: "创建应用失败，请稍后再试"
        });
      }
      else 
        if (data >= 10) 
          checkRepetition.fire("checkNumbers", false);
        else 
          checkRepetition.fire("checkNumbers", true);
    });
  }
}
/***
 * 显示创建新应用页面
 * @param {} req
 * @param {} res
 */
exports.showNewApp = function(req, res){
  res.render("newApp", {layout:"layoutMain",nickName:req.session.nickName, email:req.session.email});
}

exports.deleteApp = function(req, res){
	var delDomain = req.body.domain||'';
	var body;
	if(!delDomain){
		res.sendJson( {done:false});
	}else{
		var deleteEvent = new EventProxy();
		deleteEvent.assign("deletedBasic", "deletedMem", "deletedRecords", "deleteDir", "deleteDb", "deletedTodos", function(){
			if(!arguments[0] || !arguments[1] || !arguments[2]||!arguments[3] || !arguments[4], arguments[5])
				res.sendJson( {done:false});
			else{
				res.sendJson( {done:true});
			}
		});
		deleteEvent.once("deleteDb", function(deleteDb){
			if(!deleteDb){
				return deleteEvent.fire("deleteBasic", false);
			}
			app_basic.remove({appDomain:delDomain}, function(err){
				if(err){
          log.error(err.toString());
					deleteEvent.fire("deletedBasic", false);
				}
				else{
					deleteEvent.fire("deletedBasic", true);
				}
			});
		});
		app_basic.findOne({appDomain:delDomain}, function(err, data){
			if(err){
        log.error(err.toString());
				return deleteEvent.fire("deleteDb", false);
			}if(!data){
         return log.error("在app_basic中没有找到这个应用");
      }
      if (!data.appDbName) {
        deleteEvent.fire("deleteDb", true);
      }
      else {
        var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoDeletor.sh " +
        data.appDbName;
        exec(command, function(err){
          console.log(command);
          if (err) {
            log.error(err.toString());
            deleteEvent.fire("deleteDb", false);
          }
          else {
            deleteEvent.fire("deleteDb", true);
          }
        });
      }
		});
		app_mem.remove({appDomain:delDomain}, function(err){
			if(err){
        log.error(err.toString());
				deleteEvent.fire("deletedMem", false);
			}
			else{
				deleteEvent.fire("deletedMem", true);
			}
		});
		records.remove({appDomain:delDomain}, function(err){
			if(err){
        log.error(err.toString());
				deleteEvent.fire("deletedRecords", false);
			}
			else{
				deleteEvent.fire("deletedRecords", true);
			}
		});
    app_todo.remove({appDomain:delDomain}, function(err){
      if(err){
        log.error(err.toString());
				deleteEvent.fire("deletedTodos", false);
      }else{
				deleteEvent.fire("deletedTodos", true);        
      }
    })		

		onOff("stop", delDomain, function(){
			exec('rm -rf ' + uploadDir+"/"+delDomain, function(err){
			if(err){
				console.log(err);
				deleteEvent.fire("deleteDir", false);
			}else{
				deleteEvent.fire("deleteDir", true);
			}
			});
		});
	}
}
/***
 * 处理参加应用请求
 * @param {} req
 * @param {} res
 */
exports.joinApp = function(req, res){
	var domain = req.body.domain||'';
	if(!domain) res.sendJson( {done:false});
	else{
		app_mem.update({appDomain:domain, email:req.session.email},
		{$set:{active:1}}, function(err){
			if(err)
				res.sendJson( {done:false});
			else{
				res.sendJson( {done:true});
				records.save({appDomain:domain, email:req.session.email,
				action:"接受邀请", recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
			}
		})
  	}
}
/***
 * 处理退出应用请求
 * @param {} req
 * @param {} res
 */
exports.deleteCoop = function(req, res){
	var domain = req.body.domain||'';
	if(!domain) res.sendJson( {done:false});
	else{
		app_mem.remove({appDomain:domain, email:req.session.email},
		function(err){
			if(err){
				res.sendJson( {done:false});
			}
			else{
				res.sendJson( {done:true});
				records.save({appDomain:domain, email:req.session.email,
				action:"退出项目", recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
			}
			});
		}
	}
/***
 * 检测域名是否被占用
 * @param {} req
 * @param {} res
 */
exports.checkAppDomain = function(req, res){
	var domain = req.body.domain||'';
	app_basic.findOne({appDomain:domain}, function(err, data){
		if(err)
			res.sendJson( {});
		else if(data)
			res.sendJson( {warn:"域名已经被使用"});
			else
			res.sendJson( {});
	})
}
/***
 * 处理权限查询请求
 * @param {} req
 * @param {} res
 */
exports.getOwnAuthInfo = function(req, res){
	var email = req.session.email||'',
		domain = req.body.domain||'';
			//查找权限
			app_mem.findOne({appDomain:domain, email:email}, function(err ,data){
				if(err){
					return res.sendJson( {status:"error",msg:"数据库查询错误"});
				}else{
          if(data)
					  return res.sendJson( {status:"ok", role:data.role, active:data.active});
				  else
            return res.sendJson({status:"error", msg:"没有权限访问这个应用"});
        }
			});
}

/***
 * 当输入无效页面的时候，返回到主页面
 * @param {} req
 * @param {} res
 */
 exports.pageNotFound = function(req, res){
 	res.redirect("/application");
 }
