var config = require('../../config'),
  	log = config.logWithFile,
  	model = require('../../models/index'),
	users = model.users,
  	randomStringNum = require('../../lib/randomString').getRandomStringNum,
  	checkTBSession = require('../../lib/checkTBSession'),
    labsConf = config.labsConf;
/***
 * 显示登录页面
 * @param {} req
 * @param {} res
 */

exports.show = function(req, res){
	//res.end();
	if(config.switchs.daily){
	   res.redirect(labsConf.loginPathDaily);
	}else{
	res.redirect(labsConf.loginPath);
    }
};

function addNewUser(res, name, cb){
	users.save({email:name, nickName:name, password:'',
		dbUserName:randomStringNum(12),
		dbPassword:randomStringNum(10)}, function(err){
		if(err){
			log.error(err.toString());
			cb("存储用户数据失败，请稍后再试。");
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

var checkLogin = exports.checkLogin = function(req, res) {
	checkTBSession(req, function(checkRes) {
		if(checkRes.status === "false") {
			console.log("err");
			res.render(error, {
				message : res.msg
			});
		}
		var nick = checkRes.taobao_nick;
		users.findOne({
			email : nick
		}, function(err, item) {
			if(err) {
				log.error(err.toString());
				return res.render("error", {
					message : "获取用户数据失败，请稍后再试。"
				});
			}
			if(!item) {
				return addNewUser(res, nick, function(err) {
					if(err) {
						return res.render("error", {
							message : err.toString
						});
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
	if(config.switchs.daily){
	   res.redirect(labsConf.loginPathDaily);
	}else{
	res.redirect(labsConf.loginPath);
    }
}