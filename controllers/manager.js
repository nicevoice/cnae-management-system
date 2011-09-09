var config = require('../config')
  , sendMail = require('../lib/sendMail')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , onOff = require('../lib/socket').onOff
  , getLog = require('../lib/socket').getLog
  , randomString = require('../lib/randomString')
  , child
  , db = config.db
  , log = config.logWithFile
  , users = db.collection(config.db_user)
  , app_mem = db.collection(config.db_app_mem)
  , app_basic = db.collection(config.db_app_basic)
  , records = db.collection(config.db_app_records)
  , EventProxy = require('EventProxy.js').EventProxy  
  , nodemailer = config.nodemailer
  , mailContent = config.mailContent
  , mailTitle = config.mailTitle
  , mails = sendMail.mails
  , mailEvent = sendMail.mailEvent
  , urlMoudle = require('url')
  , uploadDir = config.uploadDir
  , randomStringNum = require('../lib/randomString').getRandomStringNum
  , options = config.options;
//汇总信息
exports.sum = function(req, res){
	var domain = req.params.id;
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	app_basic.findOne({appDomain:domain}, function(err, data){
		if(err){
			log.error(err);
			return res.render("error",{message:"查询数据库错误，请稍后再试"});
		}
		else if(data){
			return res.render("appManageSum", {layout:"layoutApp", url:url, domain:domain,appName:data.appName,appDes:data.appDes,
			dbType:data.appDbType, dbName:data.appDbName, nickName:req.session.nickName, email:req.session.email});
		}
		else{
			return res.render("error", {message:"数据库不存在该应用"});
		}
	});
}

exports.doControlApp = function(req, res){
	var domain = req.params.id,
		action = req.body.action;
	if(action === "上线"){
		action = "start";
	}else if(action==="下线"){
		action = "stop";
	}
	onOff(action, domain, function(data){
		res.sendJson( data);
	})
	//todo 添加启动停止
	/*var controlEvent = new EventProxy();
	var req = http.request(options, function(res){
	console.log("got response:" + res.statusCode);
	console.log("headers:" + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	var resData="";
	res.on('data', function(chunk){
	console.log("body:" + chunk);
	resData+=chunk;
	});
	res.on('end', function() {
	console.log('end');
	controlEvent.fire("getRes", );
	});
	res.on('error',function(err) {
	console.log('res error', err);
	controlEvent.fire("getRes", err);
	});
	}).on('error', function(e){
	console.log("got error:" + e.message);
	});*/
	
}
//资源报表
exports.report = function(req, res){
	var domain = req.params.id;
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	return res.render("appManageReport", {layout:"layoutApp", url:url, domain:domain
	, nickName:req.session.nickName, email:req.session.email});
}

exports.stat = function(req, res){};

//应用设置
exports.appmng = function(req, res){
	var domain = req.params.id;
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	//获取应用数据
	app_basic.findOne({appDomain:domain.toString()}, function(err, data){
		if(err){
			log.error(err);
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else{
			res.render("appManageInfo", {layout:"layoutApp", appInfo:data, 
			nickName:req.session.nickName, url:url, email:req.session.email});
		}
	})
};
/***
 * 处理修改应用信息请求
 * @param {} req
 * @param {} res
 */
exports.doAppmng = function(req, res){
	var domain = req.params.id||'';
	var newAppName = req.body.newAppName||'';
	var body;
	if(!newAppName){
		res.sendJson( {done:false});
	}else{
		var newAppDes = req.body.newAppDes||'';
		var updateInfoEvent = new EventProxy();
		updateInfoEvent.assign("updatedBasic", "updatedMem", "saveRecords",
		function(){
			if(!arguments[0]||!arguments[1]||!arguments[2]){
				res.sendJson( {done:false});
			}
			else{
				res.sendJson( {done:true});
			}
		})
		app_basic.update({appDomain:domain.toString()},
		{$set:{appName:newAppName.toString(), appDes:newAppDes.toString()}},
		function(err){
			if(err){
				log.error(err);
				updateInfoEvent.fire("updatedBasic", false);
			}else
				updateInfoEvent.fire("updatedBasic", true);
		});
		app_mem.update({appDomain:domain.toString()}, {$set:{appName:newAppName.toString()}},
		function(err){
			if(err){
				log.error(err);
				updateInfoEvent.fire("updatedMem", false);
			}else
				updateInfoEvent.fire("updatedMem", true);
		});
		records.save({appDomain:domain.toString(), email:req.session.email.toString(),
		action:"修改应用信息", recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(err){
			if(err){
			log.error(err);
			updateInfoEvent.fire("saveRecords", false);
			}else{
			updateInfoEvent.fire("saveRecords", true);
			}
		});
	}
}
//成员管理
exports.coopmng = function(req, res){
	var domain = req.params.id;
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	var coopEvent = new EventProxy();
	coopEvent.assign("getMems", "getOwn", function(){
		return res.render("appManageCoop", {layout:"layoutApp", url:url, nickName:req.session.nickName,
		mems:arguments[0], own:arguments[1], email:req.session.email});	
	});
	app_mem.find({appDomain:domain}).toArray(function(err, data){
		if(err){
			log.error();
			coopEvent.unbind();
			return res.render("error", {message:"查询数据库错误，请稍后再试"});
		}else{
			coopEvent.fire("getMems", data);
		}
	});
	app_mem.findOne({appDomain:domain, email:req.session.email},function(err, data){
		if(err){
			log.error();
			coopEvent.unbind();
			return res.render("error", {message:"查询数据库错误，请稍后再试"});
		}else{
			coopEvent.fire("getOwn", data);
		}
	});
};
/***
 * 发送邮件
 * @param {string} email 发送邮箱
 * @param {string} words 发送邀请语
 */
function send(email, words){
	var inviteNickName = email.split('@')[0];

	mails.push({
    sender: 'CNAE <heyiyu.deadhorse@gmail.com>',
    to : inviteNickName+" <" + email + ">",
    subject: mailTitle,
    html: mailContent + words,
    debug: true
	});
	mailEvent.fire("getMail");
	}
/***
 * 处理添加合作者请求
 * @param {} req
 * @param {} res
 */
exports.doCoopmng = function(req, res){
	var email = req.body.inviteEmail||'',
		words = req.body.inviteWords||'',
		role = req.body.role,
		domain = req.params.id,
		regEmail = config.regEmail;
		body;
	//未输入
	if(!email){
		res.sendJson( {done:false, why:"请输入邮箱"})
	}else
	//输入不合法
	 	if(!regEmail.exec(email)){
	 		res.sendJson( {done:false, why:"请输入合法的email地址"})
		}
	else
	//输入自身
	if(email === req.session.email){
		res.sendJson( {done:false, why:"不能邀请自己"});
	}
	else{
		app_mem.findOne({email:email,appDomain:domain}, function(err, data){
			if(err){
				return res.sendJson( {done:false, why:"数据库查询错误"});
			}else
			if(data){
				return res.sendJson( {done:false, why:"不能邀请已参加用户"});
			}else{
			//插入
			app_basic.findOne({appDomain:domain}, function(err, name){
	 		if(err){
	 			res.sendJson( {done:false, why:"数据库查询错误，请稍后再试"});
	 		}else if(name){
			 	app_mem.save({appDomain:domain.toString(), appName:name.appName.toString(),
			 	email:email.toString(), role:parseInt(role), active:0}, function(err){
			 		if(err){
			 			log.error(err);
			 			res.sendJson( {done:false, why:"数据库查询错误，请稍后再试"});
			 			}
			 		else{
			 			send(email, words);
			 			res.sendJson( {done:true, domain:domain, role:parseInt(role)});
			 			records.save({appDomain:domain.toString(), email:req.session.email.toString(),
			 			action:"邀请成员:"+email, recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
			 		}
			 	});
	 		}
		});
	}});
  }
}
/***
 * 处理删除合作者请求
 * @param {} req
 * @param {} res
 */
exports.deleteCoop = function(req, res){
	console.log("coop");
	var email = req.body.email||'';
	var domain = req.params.id||'';
	if(!email)
		res.sendJson( {done:false});
	else{
		app_mem.remove({email:email, appDomain:domain}, function(err){
			if(err){
				log.error(err);
				res.sendJson( {done:false});
			}else{
				res.sendJson( {done:true});
				records.save({appDomain:domain.toString(), email:req.session.email.toString(),
		 		action:"删除成员:"+email, recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
			}
		});
	}
}

exports.doChangeRole = function(req, res){
	var email = req.body.email||'',
		domain = req.params.id||'',
		role = req.body.role||'';
	app_mem.update({email:email, appDomain:domain}, {$set:{role:parseInt(role)}},
	function(err){
		if(err){
			res.sendJson( {done:false});
		}else{
			res.sendJson( {done:true});
		}
	})
}

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
              var unCompress = "";
              if (type === "gz") {
                unCompress = 'tar -xf ' + files.upload.path + ' -C ' + tempDir + '/' + domain;
              }
              else {
                unCompress = 'unzip ' + files.upload.path + ' -d ' + tempDir + '/' + domain;
              }
              console.log(unCompress);
              exec(unCompress, function(err, stdout, stderr){
                if (err) {
                  console.log(err);
                  console.log(350);
                  return res.render("error", {
                    message: "上传失败,请稍后再试"
                  });
                }
                else {
                  console.log("unCompress");
                  fs.readdir(tempDir + '/' + domain, function(err, files){
                    if (err) {
                      console.log(err);
                      exec("rm -rf " + tempDir + '/' + domain, function(){
                      });
                      return res.render("error", {
                        message: "上传失败,请稍后再试"
                      });
                    }
                    else {
                      fs.mkdir(savePath, '777', function(err){
                        var move = "";
                        if (err.errno !== 17) {
                          console.log(err);
                          exec("rm -rf " + tempDir + '/' + domain, function(){
                          });
                          console.log(364);
                          return res.render("error", {
                            message: "上传失败,请稍后再试"
                          });
                        }
                        else {
                          console.log("readdir");
                          if (files.length === 1 &&
                          fs.statSync(tempDir + '/' + domain + "/" + files[0]).isDirectory()) {//如果只有一个文件夹
                            move = "mv " + tempDir + '/' + domain + "/" + files[0] + "/* " + savePath;
                          }
                          else {
                            move = "mv " + tempDir + '/' + domain + "/* " + savePath;
                          }
                          console.log(move);
                          exec(move, function(err){
                            if (err) {
                              console.log(err);
                              exec("rm -rf " + tempDir + '/' + domain, function(){
                              });
                              return res.render("error", {
                                message: "上传失败,请稍后再试"
                              });
                            }
                            else {
                              exec("rm -rf " + tempDir + '/' + domain, function(){
                              });
                              var sumManage = req.url.slice(0, req.url.lastIndexOf('/'));
                              sumManage += '/sum';
                              return res.redirect(sumManage);
                            }
                          });
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

exports.gitColone = function(req, res){
  var tempDirLast = randomStringNum(15),
      tempDir = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"temp",
      gitUrl = req.body.gitUrl|"",
      gitClone = "git clone "+ req.body.gitUrl + " "+ tempDir+"/"+tempDirLast,
      savePath = uploadDir+'/'+domain +'/',
      move = "mv "+tempDir+"/"+tempDirLast + " "+ savePath; 
      exec(gitClone, function(err, gitStdout, gitStderr){
        if(err){
          console.log(err);
          exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
          return res.sendJson({status:"error", msg:"执行错误"});
        }else{
           fs.mkdir(savePath, '777', function(err){
             if(err){
               console.log(err);
               exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
               return res.sendJson({status:"error", msg:"执行错误"});
             }else{
               exec(move, function(err){
                 if(err){
                   console.log(err);
                   return res.sendJson({status:"error", msg:"执行错误"});
                 }
                 else{
                   exec("rm -rf "+tempDir+"/"+tempDirLast, function(){});
                 }
               })
             }
           })
        }
      })
}
/***
 * 
 * @param {} req
 * @param {} res
 */
exports.doDownload = function(req, res){
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
			console.log("chir error");
		}
		if(err){
			console.log(err);
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
					log.error(err);
					return res.sendJson( {done:false});
				}else{
					return res.sendJson( {done:true});
				}
			});
		}
	}
}
/***
 * 显示管理日志
 * @param {} req
 * @param {} res
 */
exports.mnglog = function(req, res){
	var domain = req.params.id||'';
	var url = req.url;
	var page = urlMoudle.parse(url, true).query.page||'1';
	var totalPage, pageNum = 10;
	url = url.slice(0, url.lastIndexOf('/'));
	records.find({appDomain:domain.toString()}).count(function(err, count){
		if(err){
			return res.render("error", {message:"数据库查询错误"});
		}else{
			totalPage = Math.ceil(count/pageNum);
			records.find({appDomain:domain},
				{sort:[['recordTime', -1]],skip:pageNum*(page-1), limit:pageNum}).toArray(
			function(err, data){
				if(err){
					log.error(err);
					return res.render("error", {message:"数据库查询错误"});
				}else{
			
					return res.render("appManageRecords", {layout:"layoutApp", records:data,
					domain:domain, nickName:req.session.nickName,
					url:url, pages:totalPage, page:page, email:req.session.email});
				
				}
			})	
		}
	})

};
exports.applog = function(req, res){
	var url = req.url,
		domain = req.params.id||'';
	url = url.slice(0, url.lastIndexOf('/'));
	res.render("appLogManage", {layout:"layoutApp", url:url, nickName:req.session.nickName,
	email:req.session.email,domain:domain});
};
exports.getStdOutput = function(req, res){
	var domain = req.params.id||'',
		action = req.body.action;
	getLog(action, domain, 1000, function(data){
		try{
		return res.sendJson( {output:data});
		}catch(e){};
	});
}

exports.getStatus = function(req, res){
	var domain = req.params.id||'';
	onOff("status", domain, function(socketRes){
		if(!socketRes || socketRes.msg){
			socketRes={rss:"", heap:"",uptime:"",
			last:"",pid:"",autorun:"",running:"", ports:[]};
		}else{
			socketRes.last = new Date(socketRes.last).format("MM/dd  hh:mm:ss");
		}
		return res.sendJson( socketRes);
	})
	}

exports.addRecord = function(req, res){
	var action = req.body.action||'',
		domain = req.params.id||'';
	records.save({appDomain:domain.toString(), email:req.session.email.toString(),
						action:action, recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){
						res.sendJson( {});
						});
}

exports.showMongo = function(req, res){
	var domain = req.params.id||'';
		url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	app_basic.findOne({appDomain:domain},function(err, data){
		if(err){
			log.error(err);
			res.render("error", {msg:"数据库错误，请稍后再试"});
		}else{
			users.findOne({email:req.session.email}, function(err, user){
				if(err){
					log.error(err);
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
	var domain = req.params.id||'',
		url = req.url,
		email = req.session.email;
	url = url.slice(0, url.lastIndexOf('/'));
	users.findOne({email:email},function(err, data){
		if(err){
			log.error(err);
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
						console.log("command err:"+err);
						return res.render("error", {message:"执行错误，请稍后再试"});
					}else{
						console.log("stdout:"+stdout);
						console.log("stderr:"+stderr);
						app_basic.update({appDomain:domain}, {$set:{appDbType:"mongo", appDbName:dbName}}, function(err){//更新应用表
							if(err){
								console.log(err);
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
  if(queryString.indexOf("db.")!==0 || queryString.indexOf("show")!==0){
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
	if(!checkQueryString(queryString)){
		return res.sendJson( {status:"error", msg:"该操作不被允许"});
	}
		queryString = "\""+queryString+"\"";
	users.findOne({email:req.session.email},function(err, data){//查找db帐号密码
		if(err){
			log.error(err);
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
						console.log(err);
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
exports.mysqlmng = function(req, res){};
exports.cornmng = function(req, res){};
