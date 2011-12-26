var config = require('../config'),
    log = config.logWithFile,
    md5 = require('../lib/utils').hex_md5,
    //models
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
    if(req.headers.referer&&req.headers.referer.indexOf('resetpassword')>=0){
      warn = "密码重置成功";
    }
    res.render("login", {layout:'layoutLogin', warn:warn, redirectUrl:redirectUrl, email:""});
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
	findOne(user, {email:userEmail.toString()}, function(err, item){
		if(err){
			log.error(err.toString());
			return res.render("error", {message:"数据库查询错误"});
		}
		else{
			if (!item) {
        return res.render("login", {
          layout:'layoutLogin',
          warn: "邮箱输入错误",
          redirectUrl:redirectUrl,
          email:userEmail
        });
      }
      if(item.status===1){
        return res.render("login", {
          layout:'layoutLogin',
          warn : '此帐号尚未激活',
          redirectUrl:redirectUrl,
          email:userEmail
        })
      }
      if(item.password!==md5(password.toString()+config.md5_secret)){
         return res.render("login", {
          layout:'layoutLogin',
          warn: "密码错误",
          redirectUrl:redirectUrl,
          email:userEmail
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
        if(!redirectUrl || redirectUrl.indexOf('http://'+req.headers.host)!==0){
          redirectUrl = '/application';
        }
        console.log(redirectUrl);
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


