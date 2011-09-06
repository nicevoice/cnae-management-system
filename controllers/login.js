var config = require('../config'),
log = config.logWithFile;
md5 = require('../lib/md5').hex_md5,
EventProxy = require('EventProxy.js').EventProxy,
users = config.db.collection(config.db_user),
inviteCode = config.db.collection(config.db_inviteCode),
urlMoudle = require('url'),
randomStringNum = require('../lib/randomString').getRandomStringNum,
resAjax = config.resAjax;
/***
 * 显示登录页面
 * @param {} req
 * @param {} res
 */
exports.show = function(req, res){
  res.render("login", {warn:""});
};
/***
 * 显示注册页面
 * @param {} req
 * @param {} res
 */
exports.regist = function(req, res){
	var queryString = urlMoudle.parse(req.url, true).query,
		email = queryString.email||'',
		code = queryString.code||'';
	console.log(code);
	res.render("regist",{email:email,code:code});
}
/***
 * 检测登录请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkLogin = function(req, res){
	var userEmail = req.body.userEmail,
		password = req.body.password,
		autoLogin = req.body.autoLogin;
	//验证用户输入
	var regEmail = config.regEmail;
	console.log(regEmail);
	if(!regEmail.exec(userEmail))
		return res.render("login", { warn:"用户名格式不正确"});
	var regPassword = /^(\w){6,20}$/;
	if(!regPassword.exec(password))
		return res.render("login", { warn:"密码须为6～20个字母或者数字组成"});
	//数据库查找
	users.findOne({email:userEmail.toString(), password:password.toString()}, function(err, item){
		if(err){
			log.error(err);
			return res.render("login", { warn:"用户名或密码错误"});
		}
		else{
			if(!item)
				return res.render("login", { warn:"用户名或密码错误"});
			else{
				req.session.email =userEmail;
				req.session.nickName = item.nickName;
				if(autoLogin){
					var timeOut = config.session_timeOut;
					req.session.cookie.expires = new Date(Date.now() + timeOut);
					req.session.cookie.maxAge = timeOut;
				}
				else{
					req.session.cookie.expires = false;
				}
				res.redirect("/application");
			}
		}
	});
}
/***
 * 处理退出请求
 * @param {} req
 * @param {} res
 */
exports.logout = function(req, res){
	req.session.email = '';
	req.session.nickName = '';
	res.clearCookie('user');
	res.redirect('/login');
}
/***
 * 处理注册请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkRegist = function(req, res){

	var userEmail = req.body.newEmail
	, userNickName = req.body.newUserName
	, userPassword = req.body.newPassword
	, userPasswordCon = req.body.passwordCon
	, code = req.body.inviteCode;
	var checkEventProxy = new EventProxy();
	//检查用户输入合法性
	var regEmail = config.regEmail;
	if(!regEmail.exec(userEmail))
		return res.render("error", {message:"请输入合法的email地址"});
	var regName = /^([a-zA-Z0-9._\-]){2,20}$/;
	if(!regName.exec(userNickName))
		return res.render("error", {message:"昵称由2～20个字母/数字/._组成"});
	if(userPassword != userPasswordCon)
		return res.render("error", {message:"两次密码输入不一致"});
	var regPassword = /^(\w){6,20}$/;
	if(!regPassword.exec(userPassword))
		return res.render("error", {message:"密码必须为6～20个字母或者数字组成的字符"});
		
	//检查是否数据库中已经存在
	console.log("start assign");
	checkEventProxy.assign("checkName", "checkEmail", "checkCode", function(goodName, goodEmail, goodCode){
		console.log(goodName);
		if(!goodName)
			return res.render("error", {message:"昵称已经被注册"});
		if(!goodEmail)
			return res.render("error", {message:"email已经被注册"});
		if(!goodCode)
			return res.render("error", {message:"邀请码不正确"});
		else{
			users.save({email:userEmail, nickName:userNickName, password:userPassword, 
			dbUserName:email+"_"+randomStringNum(6), dbPassword:randomStringNum(10)}, function(err){
				if(err){
					log.error(err);
					return res.render("error", {message:"注册失败，请稍后再试"});
				}
				else{
					req.session.email = userEmail;
					req.session.nickName = userNickName;
					res.redirect("/application");
				}
			});
		}
	});
	//检查email是否已经存在
	users.findOne({email:userEmail.toString()},function(err, item){
		if(err){
			log.error(err);
			checkEventProxy.trigger("checkEmail", false);
		}else{
			if(item)
				checkEventProxy.trigger("checkEmail", false);
			else
				checkEventProxy.trigger("checkEmail", true);
		}
	});
	//检查昵称是否已经存在
	users.findOne({nickName:userNickName.toString()}, function(err, item){
		if(err){
			log.error(err);
			checkEventProxy.trigger("checkName", false);
		}else{
			if(item)
				checkEventProxy.trigger("checkName", false);
			else
				checkEventProxy.trigger("checkName", true);
		}
	});
	//检查邀请码是否正确
	var isAdmin = false;
	for(var i=0, len=config.admins.length; i<len; ++i){
		if(userEmail === config.admins[i]){
			isAdmin = true;
			break;
		}
	}
	if(isAdmin){
		checkEventProxy.trigger("checkCode", true);
	}else{
	inviteCode.findOne({code:code}, function(err, item){
		if(err){
			log.error(err);
			checkEventProxy.trigger("checkCode", false);
		}else{
			if(!item)
				checkEventProxy.trigger("checkCode", false);
			else
				checkEventProxy.trigger("checkCode", true);
				//删除改邀请码
				inviteCode.remove({code:code}, function(err){
					if(err){
						log.error(err);
					}
				});
		}	
	});
	}
	}
	
function getDbAccount(email){
	
}
/***
 * 检测email是否已被注册
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkEmail = function(req, res){
	var userEmail = req.body.email;
	var regEmail = config.regEmail;
	if(!regEmail.exec(userEmail))
		return resAjax(res, {warn:"请输入合法的email地址"});
	users.findOne({email:userEmail}, function(err, data){
		if(err){
			resAjax(res, {});
		}else{
			if(data){
			resAjax(res, {warn:"该邮箱已经被注册"});
			}else{
			resAjax(res, {});
			}
		}
	});
}
/***
 * 检测昵称是否已经被占用
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkName = function(req, res){
	var name = req.body.name;
	var regName = config.regName;
	if(!regName.exec(name))
		return resAjax(res, {warn:"昵称为2～20个字符或数字或._"});
	if(req.session.nickName && req.session.nickName===name)
		return resAjax(res, {warn:""});
	users.findOne({nickName:name}, function(err, data){
		if(err){
			resAjax(res, {});
		}else{
			if(data){
			resAjax(res, {warn:"该昵称已经被使用"});
			}else{
			resAjax(res, {});
			}
		}
	});
}
