var config = require('../config'),
    log = config.logWithFile,
    urlMoudle = require('url'),
    dns = require('dns'),
    EventProxy = require('EventProxy.js').EventProxy,
    //models
    model = require('../models/index'),
    find = model.find,
    findAndModify = model.findAndModify,
    update = model.update,
    findOne = model.findOne,
    user = config.dbInfo.collections.user,
    //send emails
    sendMail = require('../lib/sendMail'),
    mails = sendMail.mails,
    mailEvent =sendMail.mailEvent,
    mail = config.mail,
    //utils
    utils = require('../lib/utils'),
    randomStringNum = utils.getRandomStringNum,
    md5 = utils.hex_md5,
    verify = utils.verify;

exports.showRetrieve = function(req, res){
  res.render("retrieve", {layout:"layoutLogin", warn:{}});
}

exports.postRetrieve = function(req, res, next){
  var email = req.body.userEmail||'';
	if(!verify('email', email))
		return next(new Error('无效的email地址'));
  var retrieveKey = randomStringNum(15),
      retrieveTime = new Date().getTime();
  findAndModify(user, {email: email},[],
    {$set: {
      retrieveKey: retrieveKey,
      retrieveTime: retrieveTime
    }},
    function(err, userInfo){
    if(err){
      log.error(err.toString());
      if(err.toString().indexOf("No matching object found")===-1){
		    return next(err);
      }else{
		    return next(new Error('该email未注册'));      
      }      
    }else{
      if(!userInfo){
		    return next(new Error('该email未注册'));       
      }else{
        var link = config.retrieveLink+"?p="+retrieveKey+"&e="+email;
        var nickName = email.split('@')[0];
       	var codeHtml = "<a href="+link+">"+link+"</a>";
       	mails.push({
          sender: mail.sender,
          to : nickName + " <"+email + ">",
          subject: mail.retrieveMailTitle,
          html: mail.retrieveMailContent+codeHtml,
          debug: true
       	});
      	mailEvent.fire("getMail");
        var host = email.slice(email.indexOf('@')+1);
        dns.resolve4('mail.' + host, function(err, data){
          if(data){
            return res.redirect('/retrieveTips?host=mail.'+host);
          }else{
            return res.redirect('/retrieveTips?host=www.'+host);
          }
        })
      }
    }
  })
}

exports.showRetrieveTips = function(req, res){
  var host = urlMoudle.parse(req.url, true).query.host||'';
  return res.render("retrieveTips", {host:host,layout:"layoutLogin"});
}

exports.showResetPassword = function(req, res, next){
  var queryString = urlMoudle.parse(req.url, true).query,
      email = queryString.e||'',
      key = queryString.p||'';
  findOne(user, {email:email, retrieveKey:key}, function(err, data){
    if(err){
      log.error(err.toString());
      return next(err);
    }else{
      if(!data){
        return next(new Error('无效的链接'))
      }else{
        var now = new Date().getTime(),
            oneDay = 1000*60*60*24;
        if(!data.retrieveTime || now - data.retrieveTime >oneDay){
          return next(new Error('该链接已过期，请重新申请'));
        }else{
          return res.render("resetPassword",{email:email, key:key, layout:"layoutLogin"});
        }
      }
    }
  })
}
exports.resetPassword = function(req, res, next){
  var email = req.body.email||'',
      key = req.body.key||'',
      password = req.body.changePassword||'',
      con = req.body.changeConfirmation||'';
  if(!verify('password', password)){
    return next(new Error('密码至少为6位'));
	}else{
		if (con && password !== con) {
      return next(new Error('两次密码不一致'));
    }
    else {
      findOne(user, {
          email:email,
          retrieveKey:key
      }, function(err, data){
          if(err){
              log.error(err.toString());
              return next(err);
          }
          if(!data||data.length===0){
              return next(new Error('错误的激活链接'));              
          }
          update(user, {email:email}, {$set:{
              password:md5(password+config.md5_secret),
              retrieveKey: undefined,
              retrieveTime: undefined
          }}, function(err){
              if(err){
                  log.error(err.toString());
                  return next(err);
              }
              return res.redirect('/login');
          })
      })
    }
	}
}
