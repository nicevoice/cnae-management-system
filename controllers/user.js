var config = require('../config'),
log = config.logWithFile,
EventProxy = require('EventProxy.js').EventProxy,
randomStringNum = require("../lib/randomString").getRandomStringNum,
md5 = require('../lib/md5').hex_md5,
app_basic = config.db.collection(config.db_app_basic);
users = config.db.collection(config.db_user);
/***
 * 跳转到显示用户信息页面
 * @param {} req
 * @param {} res
 */
exports.show = function(req, res){
  res.redirect('/userCenter/userInfo');
};
/***
 * 显示用户信息
 * @param {} req
 * @param {} res
 */
exports.userInfo = function(req, res){
	var email = req.session.email;
	console.log(email);
	if(email === "dead_horse@qq.com"){
	  var now = new Date().getTime();
    console.log(now);
		app_basic.update({},{$set:{appCreateDate:now}},{multi:true},
		  function(err, data){
        if(err){
          console.log(err.toString());
        }else{
          console.log(data);
        }
			});
	}
	users.findOne({email:email.toString()}, function(err, data){
		if(err){
			log.error(err);
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else{
			res.render("userInfo", {layout:"layoutUser", user:data, nickName:req.session.nickName, email:req.session.email});
		}		
	})
}
/***
 * 显示修改信息页面
 * @param {} req
 * @param {} res
 */
exports.changeInfo = function(req, res){
	var email = req.session.email;
	users.findOne({email:email.toString()}, function(err, data){
		if(err){
			log.error(err);
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else{
			res.render("changeInfo", {layout:"layoutUser", user:data, nickName:req.session.nickName, email:req.session.email});
		}		
	})
}
/***
 * 显示修改密码页面
 * @param {} req
 * @param {} res
 */
exports.changePassword = function(req, res){
	res.render("changePassword", {layout:"layoutUser", nickName:req.session.nickName, email:req.session.email});
}
/***
 * 处理修改信息请求
 * @param {} req
 * @param {} res
 */
exports.doChangeInfo = function(req, res){
	var newNickName = req.body.changeNickName||'',
		newRealName = req.body.changeRealName||'',
		newTelNumber = req.body.changeTelNumber||'',
		newMainPage = req.body.changeMainPage||'';
	var regName = config.regName;
	if(!regName.exec(newNickName)){
		return res.sendJson({done:false, message:"请输入合法的昵称"});
	}
	users.findOne({nickName:newNickName.toString()}, function(err, data){
		if(err){
			log.error(err);
			return res.sendJson( {done:false,message:"连接错误，请稍后再试"});
		}else{
			if(data && data.nickName!=req.session.nickName){
				return res.sendJson( {done:false,message:"昵称已存在"});
		}else{
			users.update({email:req.session.email.toString()},{$set:
				{nickName:newNickName.toString(), realName:newRealName.toString(),
				telNumber:newTelNumber.toString(), mainPage:newMainPage.toString()}},
				function(err){
					if(err){
						log.error(err);
						return res.sendJson( {done:false,message:"连接错误，请稍后再试"});
					}else{
						req.session.nickName = newNickName;
						//return res.sendJson( {done:true});
					  return res.sendJson({done:true});
          }
				})
		}
	}
	});
}
/***
 * 处理修改密码请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.doChangePassword = function(req, res){
	var oldPassword = req.body.oldPassword,
		newPassword = req.body.changePassword,
		confirmation = req.body.changeConfirmation;
	var regPass = config.regPass;
	if(!regPass.exec(newPassword)){
			return res.sendJson({done:false, message:"密码必须为6～20位字符或者数字"});
	}
	if(newPassword != confirmation){
		return res.sendJson( {done:false,message:"两次密码必须一致"});
	}
	else{
		var checkEvent = new EventProxy();
		checkEvent.once("checkOK", function(ok){
			if(!ok){
				return res.sendJson( {done:false,message:"错误的原始密码"});
			}else{
				users.update({email:req.session.email.toString()}, {$set:{password:md5(newPassword.toString()+config.md5_secret)}},
				function(err){
					if(err){
						return res.sendJson( {done:false,message:"连接错误，请稍后再试"});
					}else{
						return res.sendJson( {done:true});					
						}
				});
			}
		});
		users.findOne({email:req.session.email.toString(), password:md5(oldPassword.toString()+config.md5_secret)},
		function(err, data){
			if(err){
				log.error(err);
				checkEvent.trigger("checkOK", false);
			}else{
				if(data){
					checkEvent.trigger("checkOK", true);
				}else{
					checkEvent.trigger("checkOK", false);
				}
			}
		});
	}
}