var EventProxy = require('EventProxy.js').EventProxy,
    urlMoudle = require('url'),
    //config
    config = require('../config'),
    log = config.logWithFile,
    githubInfo = config.github,
    //models
    model = require('../models/index'),
    findOne = model.findOne,
    find = model.find,
    update = model.update,
    user = config.dbInfo.collections.user,
    //utils
    utils = require('../lib/utils'),
    randomStringNum = utils.getRandomStringNum,
    addGithub = utils.addGithub,
    md5 = utils.hex_md5,
    verify = utils.verify;

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
  if(!verify('name', newNickName)){
    return res.sendJson({done:false, message:"请输入正确的昵称"});
  }
  if(newMainPage&&!verify('url', newMainPage)){
    return res.sendJson({done:false, message:"请输入正确的个人主页"});
  }
  if(newTelNumber&&!verify('mobile', newTelNumber)){
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
  if(!verify('password', newPassword)){
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

/**
*  显示github信息
*/
exports.github = function(req, res){
  res.render("githubInfo", {layout:"layoutUser", nickName:req.session.nickName, email:req.session.email});    
}

/**
* 获取用户的github信息
*/
exports.githubInfo = function(req, res){
  var email = req.session.email||'';
  findOne(user, {email:email}, function(err, data){
    if(err){
      log.error(err.toString());   
      return res.sendJson({
          status:"error",
          msg:"数据库查询错误"
        });
    }else{
      if(!data){
        return res.sendJson({
          status:"error",
          msg:"未找到此用户"
        });
      }else{
        var email="", pubKey="", github=data.github;
        if(github){
          email = github.email||'';
          pubKey = github.pubKey||'';
        }
        return res.sendJson({
          status:"ok",
          content:{
            email:email,
            pubKey:pubKey
          }
        }); 
      }
    }
  })
}

/**
* 设置github信息
*/

exports.setGithubInfo = function(req, res){
  var email = req.session.email||'',
      githubEmail = req.body.githubEmail||'',
	    proxy = new EventProxy();
	findOne(user, {email:email}, function(err ,usr){
		if(err){
		  log.error(err.toString());
		  return res.sendJson({status:"error", msg:"数据库查找失败。请稍后再试"});
		}
		if(usr.github&&usr.github.email===githubEmail){
		  return res.sendJson({status:"error", msg:"已绑定此github邮箱"});
		}
		proxy.once("genKey", function(data){
		    if(data.status!=="ok"){
		      return res.sendJson(data);
		    }
		    update(user, {email:email}, {$set:{
		    		github:data.content
		    	}}, function(err){
		    	  if(err){
		    	    log.error(err.toString());
		    	    return res.sendJson({
		    	    	  status:"error",
		    	    	  msg:"数据库更新失败，请稍后再试"
		    	    	})
		    	  }else{
		    	  	return res.sendJson({status:"ok"});
		    	  }
		    	})
		})
		if(githubEmail){
			  console.log(githubEmail);
				addGithub(email, githubEmail, function(err, data){
					  if(err){
					    proxy.fire('genKey', {status:"error", msg:err.message});
					  }else{
					    proxy.fire('genKey', data);
					  }
				})
		}
	})
}