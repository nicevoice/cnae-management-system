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
    var queryString = urlMoudle.parse(req.url, true).query,
        redirectUrl="", warn = "";
    if(queryString&&queryString.redirect_url){
        redirectUrl = queryString.redirect_url;
        warn = "请先登录后再访问此页面"
    }
    res.render("login", {layout:false, warn:warn, redirectUrl:redirectUrl});
};
/***
 * 检测登录请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkLogin = function(req, res){
	var	userEmail = req.body.email||'',
		  password = req.body.pwd||'',
		  redirectUrl = req.body.redirectUrl||'',
		  autoLogin = req.body.remeber_me||'';
	//数据库查找
	findOne(user, {email:userEmail.toString(), password:md5(password.toString()+config.md5_secret)}, function(err, item){
		if(err){
			log.error(err.toString());
			return res.render("error", {message:"数据库查询错误"});
		}
		else{
			if (!item) {
        return res.render("login", {
          layout:false,
          warn: "用户名或密码错误",
          redirectUrl:redirectUrl
        });
      }
      else {
        log.info(userEmail + " login");
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
        redirectUrl = redirectUrl?redirectUrl:'/application';
        res.redirect(redirectUrl);
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
	req.session.destroy(function(err){
        if(err)
            log.error(err.toString());
    });
    res.redirect('/');
}


