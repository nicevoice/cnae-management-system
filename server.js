var express = require('express'),
	ejs = require('ejs'),
	config = require('./config'),
	login = require('./controllers/login'),
	manager = require('./controllers/manager'),
	user = require('./controllers/user'),
	feedback = require('./controllers/feedback'),
	main = require('./controllers/main'),
	EventProxy = require('EventProxy.js').EventProxy,
	md5 = require('./lib/md5').hex_md5,
	form = require('connect-form'),
	log = config.logWithFile,
	users = config.db.collection(config.db_user),
	app_mem = config.db.collection(config.db_app_mem);
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
	secret: config.session_secret
}));

//post
app.use(express.bodyParser());

app.use(express.logger({ format: '\x1b[36m:method\x1b[0m \x1b[90m:url\x1b[0m :response-time' }));

app.helpers({
config:config
});

//views setting
app.set("view engine", "html");
app.set("views", __dirname + '/views');
app.register("html", ejs);

//路由中间件
var checkCookieEvent = new EventProxy();
function verifyCookie(req, res){
		console.log(req.cookies.user);
		if(!req.cookies.user)
			return checkCookieEvent.fire("checked", false);
		var infos = req.cookies.user.split(',');
		//如果超时
		if(Date.now()-parseInt(infos[1])>config.cookies_timeOut)
			return checkCookieEvent.fire("checked", false);
		var getUserInfoEvent = new EventProxy();
		getUserInfoEvent.on("getData", function(data){
			if(data){
				var code = md5(infos[0]+data.password+infos[1]+config.cookies_skey);
				console.log(code);
				if(code !== infos[2])
					return checkCookieEvent.fire("checked", false);
				else{
					req.session.nickName = data.nickName;
					req.session.email = data.email;
					req.session.cookie.expires = false;
					return checkCookieEvent.fire("checked", true);
				}
			}
			else{
				checkCookieEvent.fire("checked", false);
			}
		})
		users.findOne({email:infos[0].toString()}, function(err, data){
			getUserInfoEvent.fire("getData", data);
		});	
}

function hasLogin(req, res, next){
	if(!req.session.email || !req.session.nickName){
		//检查cookie
/*		console.log(req.cookies.user);
		if(req.cookies.user){
			var infos = req.cookies.user.split(',');
			//如果超时了，删除掉cookie
			if(Date.now()-parseInt(infos[1])>config.cookies_timeOut)
			{
				return res.redirect("/login");
			}
			else{//如果未超时，检查code，如果正确，则设置session
				var checkCookie = new EventProxy();
				checkCookie.on("checkCookie", function(data){
					if(data){
						var code = md5(infos[0]+data.password+infos[1]+config.cookies_skey);
						console.log(code);
						if(code !== infos[2])
							return res.redirect("/login");
						else{
							console.log("session!");
							req.session.email = data.email;
							req.session.nickName = data.nickName;
							next();
						}
					}
					else{
						return res.redirect("/login");
					}
				});
				users.findOne({email:infos[0]}, function(err, data){
						checkCookie.fire("checkCookie", data);
					});
			}
		}
		else{
		return res.redirect("/login");
		}//console.log("then");*/
		checkCookieEvent.once("checked", function(ok){
			if(ok){
				next();
			}else{
				return res.redirect("/login");
			}
		});
		verifyCookie(req, res);
	}
	else{
		next();
	}
}
function hasNotLogin(req, res, next){
	if(req.session.email && req.session.nickName){
		return res.redirect("/");
	}
	else{
		checkCookieEvent.once("checked", function(ok){
			console.log("notlogin");
			if(ok)
				return res.redirect("/");
			else
				next();
		});
		verifyCookie(req, res);
	}
}

//检测是否有权限访问这个应用
function checkAuth(req, res, next){
	var domain = req.params.id;
	var email = req.session.email;
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
//联系
app.get("/feedback", hasLogin, feedback.show);
//应用管理模块

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

app.post("/application/manage/:id/appmng", hasLogin, checkChangeAuth(1), manager.doAppmng);
app.post("/application/manage/:id/coopmng", hasLogin, checkChangeAuth(0), manager.doCoopmng);
app.post("/application/mamage/:id/deleteCoop", hasLogin, checkAuth,checkChangeAuth(0), manager.deleteCoop);
app.post("/application/manage/:id/upload", hasLogin, checkChangeAuth(2), manager.doUpload);
app.post("/application/manage/:id/changeRole", hasLogin, checkChangeAuth(0), manager.doChangeRole);
app.post("/application/manage/:id/controlApp", hasLogin, checkChangeAuth(2), manager.doControlApp);
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
app.post("/getOwnAuthInfo", hasLogin, main.getOwnAuthInfo);
app.get("*", main.pageNotFound);

app.listen(config.port);
console.log("server start http://localhost:" + config.port);
