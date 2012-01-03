var config = require('../config'),
    urlMoudle = require('url'),
    dns = require('dns'),
    log = config.logWithFile,
    EventProxy = require('EventProxy.js').EventProxy,
    DBERROR = config.dbError,
    //models
    model = require('../models/index'),
    findOne = model.findOne,
    remove = model.remove,
    update = model.update,
    insert = model.insert,
    findAndModify = model.findAndModify,
    collectionNames = config.dbInfo.collections,
    user = collectionNames.user,
    inviteCode = collectionNames.inviteCode,
    //utils
    utils = require('../lib/utils'),
    md5 = utils.hex_md5,
    randomStringNum = utils.getRandomStringNum,
    verify = utils.verify,
    //send emails
    sendMail = require('../lib/sendMail'),
    mails = sendMail.mails,
    mailEvent =sendMail.mailEvent,
    mail = config.mail;
/***
 * 显示注册页面
 * @param {} req
 * @param {} res
 */
exports.regist = function(req, res){
  var queryString = urlMoudle.parse(req.url, true).query,
    email = queryString.email||'',
    code = queryString.code||'';
  res.render("regist",{layout:'layoutLogin'});
}

/***
 *  发送激活邮件
 *
 */
 var activateEmail = function(email, activateKey){
  var link = config.registActivateLink+"?k="+activateKey+"&e="+email;
  var nickName = email.split('@')[0];
  var codeHtml = "<a href="+link+">"+link+"</a>";
  mails.push({
    sender: mail.sender,
    to : nickName + " <"+email + ">",
    subject: mail.registMailTitle,
    html: mail.registMailContent+codeHtml,
    debug: true
  });
  mailEvent.fire("getMail");  
 }

/***
 * 处理注册请求
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkRegist = function(req, res, next){
  var userEmail = req.body.newEmail||''
  , userNickName = req.body.newUserName||''
  , userPassword = req.body.newPassword||''
  , userPasswordCon = req.body.passwordCon||''
  , code = req.body.inviteCode||'';
  var checkEventProxy = new EventProxy();
  //检查用户输入合法性
  if(!verify('email', userEmail)){
    return res.sendJson({status:'error', warn:'emailErr'});
    }
  if(!userNickName){
    return res.sendJson({status:'error', warn:'noNick'});
  }
  if(!verify('name', userNickName))
    return res.sendJson({status:'error', warn:'nickErr'});
  if(userPassword != userPasswordCon)
    return res.sendJson({status:'error', warn:'diffPass'});
  if(!verify('password', userPassword))
    return res.sendJson({status:'error', warn:'passErr'});
  //检查是否数据库中已经存在
  checkEventProxy.assign("checkName", "checkEmail", "checkCode", function(goodName, goodEmail, goodCode){
    if(!goodName)
          return res.sendJson({status:'error', warn:'nickUsed'});
    if(!goodEmail)
          return res.sendJson({status:'error', warn:'emailUsed'});
    if(!goodCode)
          return res.sendJson({status:'error', warn:'codeErr'});
    else{
        var codes = [];
        for(var i=0,len=config.maxInviteCode; i!=len; ++i){
            codes.push(randomStringNum(11));
        }
      var activateKey = randomStringNum(12);  
      insert(user, {email:userEmail, nickName:userNickName, password:md5(userPassword+config.md5_secret), 
      dbUserName:randomStringNum(12), dbPassword:randomStringNum(10), inviteCode:codes, 
      registTime:new Date().getTime(), status:1, activateKey:activateKey}, function(err){
        if(err){
          log.error(err.toString());
          return next(err);
        }
        else{
        //删除改邀请码
          update(user, {
              inviteCode:code
          }, {$pull:{
              inviteCode:code
          }},function(err){
            if(err){
              log.error(err.toString());
            }
          });
          //发送激活邮件
          activateEmail(userEmail, activateKey);
          var host = userEmail.slice(userEmail.indexOf('@')+1);
          dns.resolve4('mail.' + host, function(err, data){
            if(data){
              return res.sendJson({status:'ok', target:'/registTips?host=mail.'+host});
            }else{
              return res.sendJson({status:'ok', target:'/registTips?host=www.'+host});
            }
          })
        }
      });
    }
  });
  //检查email是否已经存在
  findOne(user, {email:userEmail.toString()},function(err, item){
    if(err){
      log.error(err.toString());
      checkEventProxy.trigger("checkEmail", false);
    }else{
      if(item)
        checkEventProxy.trigger("checkEmail", false);
      else
        checkEventProxy.trigger("checkEmail", true);
    }
  });
  //检查昵称是否已经存在
  findOne(user, {nickName:userNickName.toString()}, function(err, item){
    if(err){
      log.error(err.toString());
      checkEventProxy.trigger("checkName", false);
    }else{
      if(item)
        checkEventProxy.trigger("checkName", false);
      else
        checkEventProxy.trigger("checkName", true);
    }
  });
  //检查邀请码是否正确
  var isAdmin = false;
  for(var i=0, len=config.admins.length; i<len; ++i){
    if(userEmail === config.admins[i]){
      isAdmin = true;
      break;
    }
  }
  if(isAdmin){
    checkEventProxy.trigger("checkCode", true);
  }else{
  findOne(user, {inviteCode: code}, function(err, item){
    if(err){
      log.error(err.toString());
      checkEventProxy.trigger("checkCode", false);
    }else{
      if(!item)
        checkEventProxy.trigger("checkCode", false);
      else
        checkEventProxy.trigger("checkCode", true);
    } 
  });
  }
  }
  
    
/***
 * 检测email是否已被注册
 * @param {} req
 * @param {} res
 * @return {}
 */
exports.checkEmail = function(req, res){
  var userEmail = urlMoudle.parse(req.url, true).query.email||'';
  if(!verify('email', userEmail))
    return res.sendJson( {warn:"请输入合法的email地址"});
  findOne(user, {email:userEmail}, function(err, data){
    if(err){
      log.error(err.toString());
      res.sendJson( {});
    }else{
      if(data){
      res.sendJson( {warn:"该邮箱已经被注册"});
      }else{
      res.sendJson( {});
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
  var name = urlMoudle.parse(req.url, true).query.name||'';
  if(!verify('name', name))
    return res.sendJson( {warn:"昵称为2～20个字符或数字或._"});
  if(req.session.nickName && req.session.nickName===name)
    return res.sendJson( {warn:""});
  findOne(user, {nickName:name}, function(err, data){
    if(err){
      log.error(err.toString());
      res.sendJson( {});
    }else{
      if(data){
      res.sendJson( {warn:"该昵称已经被使用"});
      }else{
      res.sendJson( {});
      }
    }
  });
}

/***
*  显示注册邮件已发送页面
*/
exports.showRegistTips = function(req, res){
  var host = urlMoudle.parse(req.url, true).query.host||'';
  return res.render("registTips", {host:host,layout:"layoutLogin"});
}

/***
*  激活
*/
exports.activate = function(req, res, next){
  var qs = urlMoudle.parse(req.url, true).query,
  key = decodeURIComponent(qs.k||'');
  email = decodeURIComponent(qs.e||'');
  //check the activatekey
  findAndModify(user, {email:email, activateKey:key}, [],
    {$set:{
      activateKey:undefined,
      status:0
    }}, function(err, userInfo){
    if(err){
      if(err.errmsg!=='No matching object found'){
        log.error(err.toString());
        return next(err);
      }else{
        return next(new Error('无效的激活链接,请重新发送邮件'));
      }
    }
    if(!userInfo){
      return next(new Error('无效的激活链接,请重新发送邮件'));
    }
    req.session.email = userInfo.email;
    req.session.nickName = userInfo.nickName;
    return res.redirect('/application');
    })
}
exports.resend = function(req, res){
  var email = urlMoudle.parse(req.url, true).query.e || '';
  findOne(user, {email:email}, function(err, userInfo){
    if(err){
      log.error(err.toString());
      return res.sendJson({status:'error', msg:DBERROR});
    }
    if(!userInfo){
      return res.sendJson({status:'error', msg:'该email未注册'});
    }
    if(userInfo.status!==1||!userInfo.activateKey){
      return res.sendJson({status:'error', msg:'该帐号已激活'});
    }
    activateEmail(email, userInfo.activateKey);
    var host = email.slice(email.indexOf('@')+1);
    dns.resolve4('mail.' + host, function(err, data){      
      var h = 'www.' + host;
      if(data){
        h = 'mail.' + host;
      }
      res.sendJson({status:'ok', host:h});
    })    
  })
}
