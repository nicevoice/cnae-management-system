var config = require('../../config'),
    log = config.logWithFile,
    model = require('../../models/index'),
    app_mem = model.app_mem,
    app_basic = model.app_basic,
    records = model.records,
    urlMoudle = require('url'),
    EventProxy = require('EventProxy.js').EventProxy,
    fs = require('fs'),
    md5 = require('hashlib').md5,
    labsConf = require('../config.json'),
    uploadDir = config.uploadDir,
    onOff = require('../../lib/socket').onOff,
    exec  = require('child_process').exec;
    
exports.appAdd = function(req, res){
  var queryString  = urlMoudle.parse(req.url, true).query,
      userName = decodeURIComponent(queryString.userName||'');
      appName = decodeURIComponent(queryString.appName||''),
      sign = decodeURIComponent(queryString.sign||'');
  if(userName=== ''){
    return res.sendJson({"status":"false", "code":"2", "msg":"Missing parameter:userName"});
  }
  if(appName === ''){
    return res.sendJson({"status":"false", "code":"3", "msg":"Missing parameter:appName"});
  }
  if(sign === ''){
    return res.sendJson({"status":"false", "code":"4", "msg":"Missing parameter:sign"});
  }
  var secret = unescape(labsConf.secret);
  if(sign !== md5(secret+appName+userName+secret).toUpperCase()){
    return res.sendJson({"status":"false", "code":"5", "msg":"Invaild sign"});
  }
  var newAppDomain = appName,
      newAppName = appName,
      newAppDes = '',
      checkRepetition = new EventProxy();
  var regDomain = /^[a-z][a-z0-9_]{3,19}/;
  if(!regDomain.exec(newAppDomain)){
        return res.sendJson({"status":"false", "code":"6", "msg":"AppName format error"});
      }
  checkRepetition.once("checkDomain" , function(code){
   if (code===2) {
     return res.sendJson({
       status: "false",
       code: "7",
       msg: "AppName is repetition"
     });
   }else if(code===1){
     return res.sendJson({"status":"false", "code":"1", "msg":"System error:Database error"});
   }
 		else{
 			var createAppEvent = new EventProxy();
 			createAppEvent.assign("savedBasic", "savedMem", "saveRecord", function(){
        if(!arguments[0]||!arguments[1]||!arguments[2])
        {
          return res.sendJson({"status":"false", "code":"1", "msg":"System error:Database error"});
        }
 				var saveDir = uploadDir+"/"+newAppDomain;
				fs.mkdir(saveDir, '777', function(err){
					if(err){
						log.error(err.toString());
            return res.sendJson({"status":"false", "code":"1", "msg":"System error:Create appdir error"});
					}else{
						var initFile = __dirname.slice(0, __dirname.lastIndexOf('/labs')+1)+"init.tar.gz";
						exec('tar -xf '+ initFile + ' -C '+ saveDir, function(err){
						if(err){
							log.error(err.toString());
              return res.sendJson({"status":"false", "code":"1", "msg":"System error:Create example error"});
						}else{
              log.info(userName +" add app "+appName);
 				      return res.sendJson({status:"true", "code":"0", "msg":"Add app success"});              
            }
					});
				}
			});
 			})
 			//执行插入
      var now = new Date().getTime();
 			app_basic.save({appDomain:newAppDomain.toString(), appName:newAppName.toString(),
 			appDes:newAppDes.toString(), appState:0, appCreateDate:now}, function(err){
 				if(err){
 					log.error(err.toString());
 					createAppEvent.fire("saveBasic", false);
 				}
 				else{
 					createAppEvent.fire("savedBasic", true);
 				}
 			});
 			app_mem.save({appDomain:newAppDomain.toString(), appName:newAppName.toString(),
 			email:userName, role:0, active:1,joinTime:new Date().getTime()}, function(err){
        if(err){
 					log.error(err.toString());
 					createAppEvent.fire("saveMem", false);
 				}
 				else{
 					createAppEvent.fire("savedMem", true);
 				}
 			});
 			records.save({appDomain:newAppDomain.toString(), email:userName,
 			action:"创建应用", recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(err){
 				if(err){
 					log.error(err.toString());
          createAppEvent.fire("saveRecord", false);
 				}else{
 					createAppEvent.fire("saveRecord", true);
 				}
 			})
 		}   
 })
 	app_basic.findOne({appDomain:newAppDomain.toString()},function(err, item){
    if(err){
 			log.error(err.toString());
 			checkRepetition.fire("checkDomain", 1);
 		}
 		else{
 			if(item){
 				checkRepetition.fire("checkDomain", 2);
 			}
 			checkRepetition.fire("checkDomain", 0);
 		}
 	}); 
}

exports.appDel = function(req, res){
  var queryString  = urlMoudle.parse(req.url, true).query,
      userName = decodeURIComponent(queryString.userName||'');
      appName = decodeURIComponent(queryString.appName||''),
      sign = decodeURIComponent(queryString.sign||'');
  if(userName=== ''){
    return res.sendJson({"status":"false", "code":"2", "msg":"Missing parameter:userName"});
  }
  if(appName === ''){
    return res.sendJson({"status":"false", "code":"3", "msg":"Missing parameter:appName"});
  }
  if(sign === ''){
    return res.sendJson({"status":"false", "code":"4", "msg":"Missing parameter:sign"});
  }
  var secret = unescape(labsConf.secret);
  if(sign !== md5(secret+appName+userName+secret).toUpperCase()){
    return res.sendJson({"status":"false", "code":"5", "msg":"Invaild sign"});
  }
  
  var delDomain = appName;
  var regDomain = /^[a-z][a-z0-9_]{3,19}/;
  if(!regDomain.exec(delDomain)){
        return res.sendJson({"status":"false", "code":"6", "msg":"AppName format error"});
      }
  var ownCheckEvent = new EventProxy();
  ownCheckEvent.assign("checkOwn", function(isOwner){
    if(!isOwner){
      return res.sendJson({"status":"false", "code":"7", "msg":"This app isn't blong to the user"});
    }else{
     		var deleteEvent = new EventProxy();
		deleteEvent.assign("deletedBasic", "deletedMem", "deletedRecords", "deleteDir", "deleteDb", function(){
			if(!arguments[0] || !arguments[1] || !arguments[2]||!arguments[3] || !arguments[4], arguments[5])
				return res.sendJson({"status":"false", "code":"1", "msg":"System error:delete error"});
			else{
        log.info(userName +" delete app "+appName);
				return res.sendJson({"status":"ture", "code":"0", "msg":"Delete app success"});
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
         log.error("在app_basic中没有找到这个应用");
         return deleteEvent.fire("deleteDb", false);
      }
      if (!data.appDbName) {
        deleteEvent.fire("deleteDb", true);
      }
      else {
        var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoDeletor.sh " +
        data.appDbName;
        exec(command, function(err){
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

		onOff("stop", delDomain, function(){
			exec('rm -rf ' + uploadDir+"/"+delDomain, function(err){
			if(err){
				log.error(err.toString());
				deleteEvent.fire("deleteDir", false);
			}else{
				deleteEvent.fire("deleteDir", true);
			}
			});
		});    
    }
  });
  app_mem.findOne({email:userName, appDomain:delDomain,role:0}, function(err, data){
    if(err){
      log.error(err.toString());
      return res.sendJson({"status":"false", "code":"1", "msg":"System error:Database error"});
    }else{
      if(!data){
        return ownCheckEvent.fire("checkOwn", false);
      }else{
        return ownCheckEvent.fire("checkOwn", true);
      }
    }
  });
}