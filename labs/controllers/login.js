var config = require('../../config'),
    md5 = require('hashlib').md5,
    httpReq = require('../../lib/httpReq.js').httpReq,
  	log = config.logWithFile,
  	model = require('../../models/index'),
	  users = model.users,
  	randomStringNum = require('../../lib/randomString').getRandomStringNum,
    labsConf = require('../config.json'),
	  login = require('../taobao_login').login;
/***
 * 显示登录页面
 * @param {} req
 * @param {} res
 */

exports.show = function(req, res){
	console.log(labsConf.secret);
	//res.end();
	res.redirect("https://login.taobao.com/member/login.jhtml?from=labs-nae&redirect_url=http://nae.taobao.com:2012/checkLogin");
};
exports.runLogin = function(req, res, next) {
	console.log('runLogin');
	checkLogin(req, res, function(err, nick){
		if (err){
      console.log(err);
			return res.render("error", {message:err.toString()});
		}
		req.session.email = nick;
		req.session.nickName = nick;
		res.redirect('/application');
	});
}
function addNewUser(res, name, cb){
  console.log("add");
	users.save({email:name, nickName:name, password:'',
		dbUserName:randomStringNum(12),
		dbPassword:randomStringNum(10)}, function(err){
		if(err){
			log.error(err.toString());
			cb("存储用户数据失败，请稍后再试。");
			//return res.render("error", {message:"存储用户数据失败，请稍后再试。"});
		}
		cb();
	});
}
/***
 * 检测登录请求
 * @param {} req
 * @param {} res
 * @return {}
 */
var checkLogin = exports.checkLogin = function(req, res, cb){
  
	login.getNick(req.headers.cookie, function(err, nick){
		if (err) {
			log.error(err.toString());
			return cb(new Error("用户登陆失败，请稍后再试。"));
			//return res.render("error", { message:"用户登陆失败，请稍后再试。"});
		}
    //检查用户是否是开发者
    nick = nick || '';
    var secret = unescape(labsConf.secret);
    var checkUserOption = {};
    checkUserOption.host = labsConf.checkUserOption.host;
    checkUserOption.port = labsConf.checkUserOption.port;
    checkUserOption.path = labsConf.checkUserOption.path;
    
    checkUserOption.path += "?userName="+encodeURIComponent(nick)+"&sign="+md5(secret + nick + secret).toUpperCase();
		httpReq(checkUserOption, function(res){
      if(res.status==="false"){
        console.log("err");
        //return cb(new Error(res.msg));
      }
      users.findOne({email : nick}, function(err, item){
        console.log("find user");
  			if(err){
  				log.error(err.toString());
  				return cb(new Error("获取用户数据失败，请稍后再试。"));
  				//return res.render("error", { message:"获取用户数据失败，请稍后再试。"});
  			}
  			if (!item) {
  				return addNewUser(res, nick, function(){
  					cb(null, nick);
  					//res.redirect("/application");
  				});
  			} else {
  				cb(null, nick);
  			}
  		});
    });
	});
};
/***
 * 处理退出请求
 * @param {} req
 * @param {} res
 */
exports.logout = function(req, res){
	req.session.email = '';
	req.session.nickName = '';
	res.clearCookie('user');
	res.redirect('http://login.taobao.com/member/logout.jhtml?f=top');
}
