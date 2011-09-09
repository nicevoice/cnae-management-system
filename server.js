var config = require('./config');
if(!config.debug) {
    // patch net module for connect to proxy
    require('./lib/net_patch');
}

var express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	login = require('./controllers/login'),
	manager = require('./controllers/manager'),
	user = require('./controllers/user'),
	feedback = require('./controllers/feedback'),
	main = require('./controllers/main'),
	editor = require('./controllers/editor'),
	EventProxy = require('EventProxy.js').EventProxy,
	md5 = require('./lib/md5').hex_md5,
  startDel = require('./lib/deleteDownload').startDel,
	form = require('connect-form'),
	RedisStore = require('connect-redis')(express),
	inviteCode = require('./controllers/inviteCode'),
	db = config.db,
	log = config.logWithFile,
	users = config.db.collection(config.db_user),
	app_mem = config.db.collection(config.db_app_mem),
	admins = config.admins;	
	
//创建httpServer
var app = express.createServer(
	form({ uploadDir: config.uploadDir, keepExtensions: true })
  , function(req, res, next) {
        if(req.form) {
            req.form.complete(function(err, fields, files){
                req.body = {};
                if(!err) {
                    req.form.fields = fields;
                    req.form.files = files;
                    req.body = fields;
                }
                next(err);
            });
        } else {
            return next();
        }
    });
//静态解析public文件夹的文件
app.use(express.static(__dirname+'/public',{maxAge:3600000*24*30}));
//app.use(gzippo.staticGzip(__dirname+'/public',{maxAge:3600000*24*30}));
//session和cookie
app.use(express.cookieParser());
app.use(express.session({
	secret: config.session_secret,
	store : new RedisStore()
}));

//post
app.use(express.bodyParser());

//app.use(express.logger({ format: '\x1b[36m:method\x1b[0m \x1b[90m:url\x1b[0m :response-time' }));

app.helpers({
config:config
});

//views setting
app.set("view engine", "html");
app.set("views", __dirname + '/views');
app.register("html", ejs);

//格式化Date
/**
* 时间对象的格式化;
*/
Date.prototype.format = function(format){
 /*
  * eg:format="YYYY-MM-dd hh:mm:ss";
  */
 var o = {
  "M+" :  this.getMonth()+1,  //month
  "d+" :  this.getDate(),     //day
  "h+" :  this.getHours(),    //hour
      "m+" :  this.getMinutes(),  //minute
      "s+" :  this.getSeconds(), //second
      "q+" :  Math.floor((this.getMonth()+3)/3),  //quarter
      "S"  :  this.getMilliseconds() //millisecond
   }
  
   if(/((|Y|)+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
   }
 
   for(var k in o) {
    if(new RegExp("("+ k +")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    }
   }
 return format;
}

String.prototype.trim = function() {
return this.replace(/^\s+|\s+$/g, "");
}
//路由中间件

function hasLogin(req, res, next){
	//如果session不存在，
	if(!req.session.email || !req.session.nickName){
		return res.redirect("/login");
	}else{	//如果session存在
		return next();
	}
}
function hasNotLogin(req, res, next){
	//如果session存在
	if(!req.session.email || !req.session.nickName){
		return next();
	}else{
		return res.redirect("/");
	}
}

//检测是否有权限访问这个应用
function checkAuth(req, res, next){
	var domain = req.params.id||"";
	var email = req.session.email||"";
	app_mem.findOne({appDomain: domain.toString(), email:email.toString()}, 
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
		if(!data){
			return res.render("error", {message:"没有权限访问这个应用"});
		}else{
			next();
		}
	});	
}

//检测是否有权限执行这个操作
function checkChangeAuth(role) {
  return function(req, res, next) {
  	var domain = req.params.id||'';
  	var email = req.session.email||'';
	app_mem.findOne({appDomain: domain.toString(), email:email.toString()}, 
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
		if(!data){
			return res.render("error", {message:"没有权限访问这个应用"});
		}else{
			if(data.role>role||data.active!==1){
				return res.render("error", {message:"没有权限进行这个操作"});
			}else{
				next();
			}
		}
	});	
  }
}

function isAdmin(req, res, next){
	var email = req.session.email||'';
	for(var i=0, len=admins.length; i!=len; ++i){
		if(email === admins[i])
		{
			return next();
		}
	}
	res.redirect("/");
}

require('http').ServerResponse.prototype.sendJson = function(data){
  body = new Buffer(JSON.stringify(data));
	this.writeHead(200, {"Content/type":"text/json", "Content/length":body.length});
	this.end(body);
}
//routing
//登录模块
app.get("/", hasLogin, main.show);
app.get("/login",hasNotLogin, login.show);
app.post("/checkLogin", hasNotLogin, login.checkLogin);
app.get("/logout", hasLogin, login.logout);
app.get("/regist", hasNotLogin, login.regist);
app.post("/checkRegist", hasNotLogin, login.checkRegist);
app.post("/regist/checkEmail", hasNotLogin, login.checkEmail);
app.post("/regist/checkName", login.checkName);
//我的应用模块
app.get("/application", hasLogin, main.show);
app.get("/application/newApp", hasLogin, main.showNewApp);
app.post("/createApp", hasLogin, main.createApp);
app.post("/delete", hasLogin, main.deleteApp);
app.post("/join", hasLogin, main.joinApp);
app.post("/deleteCoop", hasLogin, main.deleteCoop)
app.post("/checkAppDomain", hasLogin, main.checkAppDomain);
app.post("/checkAppName", hasLogin, main.checkAppDomain);
//反馈
app.get("/feedback", hasLogin, feedback.show);
//文档中心
app.get("/doc", hasLogin, main.showDoc);

//应用管理模块
//显示
app.get("/application/manage/:id", function(req, res, next){next();});
app.get("/application/manage/:id/sum", hasLogin, checkAuth, manager.sum);
app.get("/application/manage/:id/report", hasLogin, checkAuth, manager.report);
app.get("/application/manage/:id/stat", hasLogin, checkAuth, manager.stat);
app.get("/application/manage/:id/appmng", hasLogin, checkAuth, manager.appmng);
app.get("/application/manage/:id/coopmng", hasLogin, checkAuth, manager.coopmng);
app.get("/application/manage/:id/vermng", hasLogin, checkAuth, manager.vermng);
app.get("/application/manage/:id/mnglog", hasLogin, checkAuth, manager.mnglog);
app.get("/application/manage/:id/applog", hasLogin, checkAuth, manager.applog);
app.get("/application/manage/:id/mysqlmng", hasLogin, checkAuth, manager.mysqlmng);
app.get("/application/manage/:id/cornmng", hasLogin,checkAuth, manager.cornmng);
app.get("/application/manage/:id/applog", hasLogin, checkAuth, manager.applog);
app.get("/application/manage/:id/mongo", hasLogin, checkAuth, manager.showMongo);
//修改应用信息
app.post("/application/manage/:id/appmng", hasLogin, checkChangeAuth(1), manager.doAppmng);
//发出邀请
app.post("/application/manage/:id/coopmng", hasLogin, checkChangeAuth(0), manager.doCoopmng);
//删除协作者
app.post("/application/mamage/:id/deleteCoop", hasLogin, checkAuth,checkChangeAuth(0), manager.deleteCoop);
//上传代码
app.post("/application/manage/:id/upload", hasLogin, checkChangeAuth(2), manager.doUpload);
//git clone代码
app.post("/application/manage/:id/gitclone", hasLogin, checkChangeAuth(2), manager.gitClone);
//代码打包下载
app.post("/application/manage/:id/download", hasLogin, checkChangeAuth(2), manager.doDownload);
app.get("/application/download/:id.zip", hasLogin, manager.downloading);
//更改协作者权限
app.post("/application/manage/:id/changeRole", hasLogin, checkChangeAuth(0), manager.doChangeRole);
//控制APP上下线
app.post("/application/manage/:id/controlApp", hasLogin, checkChangeAuth(2), manager.doControlApp);
//获取标准输出/错误
app.post("/application/manage/:id/getStdOutput", hasLogin,checkAuth, manager.getStdOutput);
//获取应用状态信息
app.post("/application/manage/:id/getStatus", hasLogin, checkAuth, manager.getStatus);
//添加应用管理记录
app.post("/application/manage/:id/addRecord", hasLogin, checkAuth, manager.addRecord);
//上传图片接口
app.post("/application/manage/:id/uploadImg", hasLogin, checkChangeAuth(2), manager.doUploadImg);
//给应用分配mongoDB
app.post("/application/manage/:id/createMongo", hasLogin, checkChangeAuth(2), manager.createMongo);
//应用DB查询
app.post("/application/manage/:id/queryMongo", hasLogin, checkChangeAuth(2), manager.queryMongo);
//个人中心
app.get("/userCenter", hasLogin, user.show);
app.get("/userCenter/userInfo", hasLogin, user.userInfo);
app.get("/userCenter/changeInfo", hasLogin, user.changeInfo);
app.get("/userCenter/changePassword", hasLogin, user.changePassword);
app.post("/userCenter/changeInfo", hasLogin, user.doChangeInfo);
app.post("/userCenter/changePassword", hasLogin, user.doChangePassword);
//反馈
app.get("/feedBack", hasLogin, feedback.show);
app.post("/feedBack",hasLogin, feedback.postFeed);

//获取权限
app.post("/getOwnAuthInfo", main.getOwnAuthInfo);

//邀请码模块
app.get("/inviteCode", hasLogin, isAdmin, inviteCode.showInviteCode);
app.post("/inviteCode", hasLogin, isAdmin, inviteCode.generateInviteCode);
app.post("/sendInviteCode", hasLogin, isAdmin, inviteCode.sendInviteCode);
app.post("/deleteInviteCode", hasLogin, isAdmin, inviteCode.deleteInviteCode);

// 编辑器
app.get('/editor/:id', hasLogin, checkChangeAuth(2), editor.index);
app.post('/editor/:id/filelist', hasLogin, checkChangeAuth(2), editor.listfile); // 文件列表
app.post('/editor/:id/readfile', hasLogin, checkChangeAuth(2), editor.readfile); // 读文件
app.post('/editor/:id/writefile', hasLogin, checkChangeAuth(2), editor.writefile); // 写文件
app.post('/editor/:id/renamefile', hasLogin, checkChangeAuth(2), editor.renamefile); // 文件重命名
app.post('/editor/:id/delfile', hasLogin, checkChangeAuth(2), editor.delfile); // 删除文件
app.post('/editor/:id/mkdir', hasLogin, checkChangeAuth(2), editor.mkdir); // 创建目录
app.post('/editor/:id/deldir', hasLogin, checkChangeAuth(2), editor.deldir); // 删除目录

app.get("*", main.pageNotFound);


app.listen(config.port);
console.log("server start http://localhost:" + config.port);

startDel();

var pid_path = __dirname + '/server.pid';
fs.writeFile(pid_path, '' + process.pid);
process.on('SIGINT', function () {
//    console.log('Got SIGINT.  Press Control-D to exit.', arguments);
    try {
        fs.unlinkSync(pid_path);
    } catch (e){
    }
    process.exit();
});
