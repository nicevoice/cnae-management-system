var config = require('../config')
  , log = config.logWithFile
  , db = config.db
  , app_mem = db.collection(config.db_app_mem)
  , app_basic = db.collection(config.db_app_basic)
  , users = db.collection(config.db_user)
  , records = db.collection(config.db_app_records)
  , resAjax = config.resAjax
  , urlMoudle = require('url')
  , EventProxy = require('EventProxy.js').EventProxy
  , fs = require('fs')
  , uploadDir = config.uploadDir
  , exec  = require('child_process').exec;
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
 		console.log(owns[0]);
 		res.render("main", {ownApps:owns, otherApps:others, nickName:req.session.nickName, email:req.session.email});
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
 if(newAppName.length>20){
 	return res.render("error", {message:"应用名不能超过20个字符"});
 }
  var regDomain = /^(\w){4,18}$/;
  if(!regDomain.exec(newAppDomain))
		return res.render("error", {message:"子域名格式错误"});

		//检查域名是否重复，用户创建的应用数目是否达到上限
  checkRepetition.assign("checkDomain", "checkNumbers", function(goodDomain, checkNumbers){
 		if(!goodDomain)
 			return res.render("error", {message:"该域名已经被占用"});
 		if(!checkNumbers)
 			return res.render("error", {message:"创建的应用数目已经达到上限"});
 		else{
 			var now = new Date().format("YYYY-MM-dd hh:mm:ss");
 			var createAppEvent = new EventProxy();
 			createAppEvent.assign("savedBasic", "savedMem", "saveRecord", function(){
 				console.log("done");
 				res.redirect("/application");
 			})
 			//执行插入
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
 			email:req.session.email.toString(), role:0, active:1}, function(err){
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
 			console.log("checkDomain");
 		}
 	});
 	users.find({email:req.session.userEmail}).count(function(err, data){
 		if(err){
 			log.error(err);
 			checkRepetition.unbind();
 			return res.render("error", {message:"创建应用失败，请稍后再试"});
 		}
 		else if(data>=10)
 			checkRepetition.fire("checkNumbers", false);
 		else
 			checkRepetition.fire("checkNumbers", true);
 		console.log("checkNumbers");
 	});
}
/***
 * 显示创建新应用页面
 * @param {} req
 * @param {} res
 */
exports.showNewApp = function(req, res){
  res.render("newApp", {nickName:req.session.nickName, email:req.session.email});
}

exports.deleteApp = function(req, res){
	var delDomain = req.body.domain||'';
	var body;
	if(!delDomain){
		resAjax(res, {done:false});
	}else{
		var deleteEvent = new EventProxy();
		deleteEvent.assign("deletedBasic", "deletedMem", "deletedRecords", "deleteDir", function(){
			if(!arguments[0] || !arguments[1] || !arguments[2])
				resAjax(res, {done:false});
			else{
				resAjax(res, {done:true});
			}
		});
		app_basic.remove({appDomain:delDomain}, function(err){
			if(err){
				log.error(err);
				deleteEvent.fire("deletedBasic", false);
			}
			else{
				deleteEvent.fire("deletedBasic", true);
			}
		});
		app_mem.remove({appDomain:delDomain}, function(err){
			if(err){
				log.error(err);
				deleteEvent.fire("deletedMem", false);
			}
			else{
				deleteEvent.fire("deletedMem", true);
			}
		});
		records.remove({appDomain:delDomain}, function(err){
			if(err){
				log.error(err);
				deleteEvent.fire("deletedRecords", false);
			}
			else{
				deleteEvent.fire("deletedRecords", true);
			}
		});
		exec('rm -rf ' + uploadDir+"/"+delDomain, function(err){
		if(err){
			console.log(err);
			deleteEvent.fire("deleteDir", true);
		}else{
			deleteEvent.fire("deleteDir", true);
		}
		})
	}
}
/***
 * 处理参加应用请求
 * @param {} req
 * @param {} res
 */
exports.joinApp = function(req, res){
	var domain = req.body.domain||'';
	if(!domain) resAjax(res, {done:false});
	else{
		app_mem.update({appDomain:domain, email:req.session.email},
		{$set:{active:1}}, function(err){
			if(err)
				resAjax(res, {done:false});
			else{
				resAjax(res, {done:true});
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
	if(!domain) resAjax(res, {done:false});
	else{
		app_mem.remove({appDomain:domain, email:req.session.email},
		function(err){
			if(err){
				resAjax(res, {done:false});
			}
			else{
				resAjax(res, {done:true});
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
			resAjax(res, {});
		else if(data)
			resAjax(res, {warn:"域名已经被使用"});
			else
			resAjax(res, {});
	})
}
/***
 * 处理权限查询请求
 * @param {} req
 * @param {} res
 */
exports.getOwnAuthInfo = function(req, res){
	var email = req.session.email,
		appDomain = req.body.domain;
	app_mem.find({appDomain:appDomain, email:email},
		{role:1, active:1}).toArray(
		function(err, data){
		if(err){
			resAjax(res,{});	
		}else{
			if(data[0]){
				resAjax(res, {role:data[0].role, active:data[0].active});
			}
			else{
				resAjax(res, {});
			}
		}
	})
}

/***
 * 当输入无效页面的时候，返回到主页面
 * @param {} req
 * @param {} res
 */
 exports.pageNotFound = function(req, res){
 	res.redirect("/application");
 }