var config = require('../config'),
log = config.logWithFile;
md5 = require('../lib/md5').hex_md5,
EventProxy = require('EventProxy.js').EventProxy,
users = config.db.collection(config.db_user),
inviteCode = config.db.collection(config.db_inviteCode)
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
	res.render("regist");
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
	var regEmail = /^[a-zA-Z](\w+)@(\w+).com$/;
	if(!regEmail.exec(userEmail))
		return res.render("login", {warn:"用户名格式不正确"});
	var regPassword = /^(\w){6,20}$/;
	if(!regPassword.exec(password))
		return res.render("login", {warn:"密码须为6～20个字母或者数字组成"});
	//数据库查找
	users.findOne({email:userEmail.toString(), password:password.toString()}, function(err, item){
		if(err){
			log.error(err);
			return res.render("login", {warn:"用户名或密码错误"});
		}
		else{
			if(!item)
				return res.render("login", {warn:"用户名或密码错误"});
			else{
				console.log("login");
				if(autoLogin){
					var loginTimestamp = Date.now();
					var checkCode = md5(userEmail + password +
					loginTimestamp + config.cookies_skey);
					res.cookie('user', userEmail+","+ loginTimestamp + ","+ checkCode,
					{ maxAge: config.cookies_timeOut });
					console.log("cookie");
				}
				else{
					req.session.email =userEmail;
					req.session.nickName = item.nickName;
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
	var regEmail = /^[a-zA-Z0-9](\w+)@(\w+).com$/;
	if(!regEmail.exec(userEmail))
		return res.render("error", {message:"请输入合法的email地址"});
	var regName = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;
	if(!regName.exec(userNickName))
		return res.render("error", {message:"昵称必须为5～20个字母开头，可以带数字_.的字符串"});
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
			users.save({email:userEmail, nickName:userNickName, password:userPassword}, function(err){
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
	console.log("code"+code);
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
/***
 * 检测email是否已被注册
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkEmail = function(req, res){
	var userEmail = req.body.email;
	var regEmail = /^[a-zA-Z0-9](\w+)@(\w+).com$/;
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
	var regName = /^([a-zA-Z0-9]|[._]){5,20}$/;
	if(!regName.exec(name))
		return resAjax(res, {warn:"昵称为5～20个字符或数字"});
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