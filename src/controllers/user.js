var config = require('../config'),
log = config.logWithFile,
EventProxy = require('EventProxy.js').EventProxy,
randomStringNum = require("../lib/randomString").getRandomStringNum,
md5 = require('../lib/md5').hex_md5,
model = require('../models/index'),
findOne = model.findOne,
find = model.find,
update = model.update,
user = config.dbInfo.collections.user;
/***
 * 跳转到显示用户信息页面
 * @param {} req
 * @param {} res
 */
exports.show = function(req, res){
/*    find(user, {}, function(err, data){
        for(var i=0, len=data.length; i!=len; ++i){
            var codes = [];
            for(var j=0; j!=config.maxCode; ++j){
                codes.push(randomStringNum(11));
            }
            (function(codes, email){
                console.log(email);
                console.log(codes);
                update(user, {email:email}, {$set:{inviteCode:codes}});
            })(codes, data[i].email);
        }
    })*/
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
	findOne(user, {email:email.toString()}, function(err, data){
		if(err){
			log.error(err.toString());
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
	findOne(user, {email:email.toString()}, function(err, data){
		if(err){
			log.error(err.toString());
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
  if(newRealName.length>25){
    newRealName = newRealName.slice(0, 25);
  }
	var regName = config.regName,
	    regMobile = config.regMobile,
	    regUrl = config.regUrl;
	if(!regName.exec(newNickName)){
		return res.sendJson({done:false, message:"请输入正确的昵称"});
	}
	if(!regUrl.exec(newMainPage)){
    return res.sendJson({done:false, message:"请输入正确的个人主页"});
	}
	if(!regMobile.exec(newTelNumber)){
	  return res.sendJson({done:false, message:"请输入正确的手机号码"});
	}
	findOne(user, {nickName:newNickName.toString()}, function(err, data){
		if(err){
			log.error(err.toString());
			return res.sendJson( {done:false,message:"连接错误，请稍后再试"});
		}else{
			if(data && data.nickName!=req.session.nickName){
				return res.sendJson( {done:false,message:"昵称已存在"});
		}else{
			update(user, {email:req.session.email.toString()},{$set:
				{nickName:newNickName.toString(), realName:newRealName.toString(),
				telNumber:newTelNumber.toString(), mainPage:newMainPage.toString()}},
				function(err){
					if(err){
						log.error(err.toString());
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
	var oldPassword = req.body.oldPassword||'',
		newPassword = req.body.changePassword||'',
		confirmation = req.body.changeConfirmation||'';
	var regPass = config.regPass;
	if(!regPass.exec(newPassword)){
			return res.sendJson({done:false, message:"密码不能少于6位"});
	}
	if(newPassword != confirmation){
		return res.sendJson( {done:false,message:"两次密码必须一致"});
	}
	else{
		var checkEvent = new EventProxy();
		checkEvent.once("checkOK", function(ok){
			if(!ok){
				return res.sendJson( {done:false,message:"原始密码错误"});
			}else{
				update(user, {email:req.session.email.toString()}, {$set:{password:md5(newPassword.toString()+config.md5_secret)}},
				function(err){
					if(err){
            log.error(err.toString());
						return res.sendJson( {done:false,message:"连接错误，请稍后再试"});
					}else{
						return res.sendJson( {done:true});					
						}
				});
			}
		});
		findOne(user, {email:req.session.email.toString(), password:md5(oldPassword.toString()+config.md5_secret)},
		function(err, data){
			if(err){
				log.error(err.toString());
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
