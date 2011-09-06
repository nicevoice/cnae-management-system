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
  , app_mem = db.collection(config.db_app_mem)
  , app_basic = db.collection(config.db_app_basic)
  , records = db.collection(config.db_app_records)
  , EventProxy = require('EventProxy.js').EventProxy  
  , nodemailer = config.nodemailer
  , resAjax = config.resAjax
  , mailContent = config.mailContent
  , mailTitle = config.mailTitle
  , mails = sendMail.mails
  , mailEvent = sendMail.mailEvent
  , urlMoudle = require('url')
  , uploadDir = config.uploadDir
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
			dbName:data.appDbName, nickName:req.session.nickName, email:req.session.email});
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
		resAjax(res, data);
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
		resAjax(res, {done:false});
	}else{
		var newAppDes = req.body.newAppDes||'';
		var updateInfoEvent = new EventProxy();
		updateInfoEvent.assign("updatedBasic", "updatedMem", "saveRecords",
		function(){
			if(!arguments[0]||!arguments[1]||!arguments[2]){
				resAjax(res, {done:false});
			}
			else{
				resAjax(res, {done:true});
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
		resAjax(res, {done:false, why:"请输入邮箱"})
	}else
	//输入不合法
	 	if(!regEmail.exec(email)){
	 		resAjax(res, {done:false, why:"请输入合法的email地址"})
		}
	else
	//输入自身
	if(email === req.session.email){
		resAjax(res, {done:false, why:"不能邀请自己"});
	}
	else{
		app_mem.findOne({email:email,appDomain:domain}, function(err, data){
			if(err){
				return resAjax(res, {done:false, why:"数据库查询错误"});
			}else
			if(data){
				return resAjax(res, {done:false, why:"不能邀请已参加用户"});
			}else{
			//插入
			app_basic.findOne({appDomain:domain}, function(err, name){
	 		if(err){
	 			resAjax(res, {done:false, why:"数据库查询错误，请稍后再试"});
	 		}else if(name){
			 	app_mem.save({appDomain:domain.toString(), appName:name.appName.toString(),
			 	email:email.toString(), role:parseInt(role), active:0}, function(err){
			 		if(err){
			 			log.error(err);
			 			resAjax(res, {done:false, why:"数据库查询错误，请稍后再试"});
			 			}
			 		else{
			 			send(email, words);
			 			resAjax(res, {done:true, domain:domain, role:parseInt(role)});
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
		resAjax(res, {done:false});
	else{
		app_mem.remove({email:email, appDomain:domain}, function(err){
			if(err){
				log.error(err);
				resAjax(res, {done:false});
			}else{
				resAjax(res, {done:true});
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
			resAjax(res, {done:false});
		}else{
			resAjax(res, {done:true});
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
			var savePath = uploadDir+'/'+domain +'/'+"code."+type; 
			fs.mkdir(path.dirname(savePath), '777', function(err){
					fs.rename(files.upload.path, savePath, function(err){
					if(err){
						log.error(err);
						return res.render("error",{message:"创建文件错误"});
					}
					fs.chmod(savePath, '444', function(err){
						if(err){
						return res.render("error", {message:"修改权限错误"});
						}
						var unCompress = "";
						if(type==="gz"){
							unCompress = 'tar -xf '+savePath + ' -C '+uploadDir+ '/'+domain;
						}else{
							unCompress = 'unzip '+savePath+' -d '+uploadDir+ '/'+domain;
						}
						console.log(unCompress);
						exec(unCompress, function(err, stdout, stderr){
							if(err)console.log(err);
							console.log("unCompress");
							exec('rm -rf '+savePath, function(err){
								if(err){
									console.log(err);
								}
							})
							if(err){
								console.log(err);
							}
						})
						records.save({appDomain:domain.toString(), email:req.session.email.toString(),
						action:"上传代码："+savePath.slice(savePath.lastIndexOf('/')+1), recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){});
						var codeManage = req.url.slice(0, req.url.lastIndexOf('/'));
						codeManage += '/vermng';
						return res.redirect(codeManage);
					});
					});
			});
		}else{
			return res.render("error", {message:"请上传正确的格式"});
		}
	}else{
			return res.render("error", {message:"请选择一个文件上传"});
	}
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
		return resAjax(res, {status:"error", msg:"修改工作目录失败"});
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
			return resAjax(res, {status:"error", msg:"压缩失败"});		
		}else{
			setTimeout(function(){
				fs.unlink(saveName, function(){
					console.log("删除文件");
				}, 1000*60);
			});
			return resAjax(res, {status:"ok", url:"/download/"+name});
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
					return resAjax(res, {done:false});
				}else{
					return resAjax(res, {done:true});
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
		return resAjax(res, {output:data});
		}catch(e){};
	});
}

exports.getStatus = function(req, res){
	var domain = req.params.id||'';
	onOff("status", domain, function(socketRes){
		if(!socketRes || socketRes.msg){
			socketRes={rss:"", heap:"",uptime:"",
			last:"",pid:"",autorun:"",running:"", ports:[80]};
		}else{
			socketRes.last = new Date(socketRes.last).format("MM/dd  hh:mm:ss");
		}
		return resAjax(res, socketRes);
	})
	}

exports.addRecord = function(req, res){
	var action = req.body.action||'',
		domain = req.params.id||'';
	records.save({appDomain:domain.toString(), email:req.session.email.toString(),
						action:action, recordTime:new Date().format("YYYY-MM-dd hh:mm:ss")}, function(){
						resAjax(res, {});
						});
}
exports.mysqlmng = function(req, res){};
exports.cornmng = function(req, res){};