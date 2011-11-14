var config = require('../../config'),
    md5 = require('hashlib').md5,
    httpReq = require('../../lib/httpReq.js').httpReq,
  	log = config.logWithFile,
  	model = require('../../models/index'),
	users = model.users,
  	randomStringNum = require('../../lib/randomString').getRandomStringNum,
    labsConf = require('../config.json');
/***
 * 显示登录页面
 * @param {} req
 * @param {} res
 */

exports.show = function(req, res){
	console.log(labsConf.secret);
	//res.end();
	if(labsConf.daily){
	   res.redirect(labsConf.loginPathDaily);
	}else{
	res.redirect(labsConf.loginPath);
    }
};

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
// exports.runLogin = function(req, res, next) {
    // console.log('runLogin');
    // checkLogin(req, res, function(err, nick){
        // console.log(err, nick);
        // if (err){
            // return res.render("error", {message:err.message});
        // }
        // req.session.email = nick;
        // req.session.nickName = nick;
        // res.redirect('/application');
    // });
// }
var getFromCookie = function(str, name, sign) {
    if(!str) {
        return null;
    }
    if(!sign){
        sign = ';';
    }
    var paramIndex = str.indexOf(name + '=');
    if(paramIndex == -1){
        return null;
    }
    var value;
    var beginIndex = paramIndex + name.length + 1;
    var endIndex = str.indexOf(sign, beginIndex);
    if(endIndex == -1){
        value = str.substring(beginIndex);
    }else{
        value = str.substring(beginIndex, endIndex);
    }
    return value;
};
/***
 * 检测登录请求
 * @param {} req
 * @param {} res
 * @return {}
 */
var checkLogin = exports.checkLogin = function(req, res){
	// login.getNick(req.headers.cookie, function(err, nick){
		// if (err) {
			// log.error(err.toString());
			// return cb(new Error("用户登陆失败，请稍后再试。"));
			// //return res.render("error", { message:"用户登陆失败，请稍后再试。"});
		// }
    var sessionId = getFromCookie(req.headers.cookie, "cookie2");
    //检查用户是否是开发者
    //nick = nick || '';
    var secret = unescape(labsConf.secret);
    var checkUserOption = {};
    checkUserOption.host = labsConf.checkUserOption.host;
    checkUserOption.port = labsConf.checkUserOption.port;
    checkUserOption.path = labsConf.checkUserOption.path;
    
    checkUserOption.path += "?sessionId="+encodeURIComponent(sessionId)+"&sign="+md5(secret + sessionId + secret).toUpperCase();
		httpReq(checkUserOption, function(checkRes){
      if(checkRes.status==="false"){
        console.log("err");
        res.render(error, {message:res.msg});
        //return cb(new Error(res.msg));
      }
      var nick = checkRes.taobao_nick;
      console.log(nick);
      //nick = "dead_horse";
      users.findOne({email : nick}, function(err, item){
  			if(err){
  				log.error(err.toString());
  				//return cb(new Error("获取用户数据失败，请稍后再试。"));
  				return res.render("error", { message:"获取用户数据失败，请稍后再试。"});
  			}
  			if (!item) {
  				return addNewUser(res, nick, function(err){
  					//cb(null, nick);
  					if(err){
  					    res.render("error", {message:err.toString});
  					}
                    req.session.email = nick;
                    req.session.nickName = nick;
                    return res.redirect('/application');
  				});
  			} else {
                    req.session.email = nick;
                    req.session.nickName = nick;
                    return res.redirect('/application');
  			}
  		});
    });
//	});
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
