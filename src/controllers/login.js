var config = require('../config'),
log = config.logWithFile,
md5 = require('../lib/md5').hex_md5,
model = require('../models/index'),
findOne = model.findOne,
urlMoudle = require('url'),
user = config.dbInfo.collections.user;
/***
 * 显示登录页面
 * @param {} req
 * @param {} res
 */
exports.show = function(req, res){
  res.render("login", {warn:""});
};
/***
 * 检测登录请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkLogin = function(req, res){
	var	userEmail = req.body.userEmail,
		  password = req.body.password,
		  autoLogin = req.body.autoLogin;
	//数据库查找
	findOne(user, {email:userEmail.toString(), password:md5(password.toString()+config.md5_secret)}, function(err, item){
		if(err){
			log.error(err.toString());
			return res.render("login", { warn:"数据获取失败"});
		}
		else{
			if (!item) {
        console.log("验证失败");
        return res.render("login", {
          warn: "用户名或密码错误"
        });
      }
      else {
        console.log(userEmail+" login");
        log.info(userEmail + "login");
        req.session.email = userEmail;
        req.session.nickName = item.nickName;
        if (autoLogin) {
          var timeOut = config.session_timeOut;
          req.session.cookie.expires = new Date(Date.now() + timeOut);
          req.session.cookie.maxAge = timeOut;
        }
        else {
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


