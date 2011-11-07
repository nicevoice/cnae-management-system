var config = require('../config'),
log = config.logWithFile,
md5 = require('hashlib').md5,
EventProxy = require('EventProxy.js').EventProxy,
model = require('../models/index'),
users = model.users,
urlMoudle = require('url'),
sendMail = require('../lib/sendMail'),
mails = sendMail.mails,
mailEvent =sendMail.mailEvent,
nodemailer = config.nodemailer,
randomStringNum = require('../lib/randomString').getRandomStringNum;


exports.showRetrieve = function(req, res){
  res.render("retrieve");
}

exports.postRetrieve = function(req, res){
  var email = req.body.userEmail||'';
	var regEmail = config.regEmail;
  console.log(email+":retrieve");
	if(!regEmail.exec(email))
		return res.render("error", { message:"email格式不正确"});
  var retrieveKey = randomStringNum(15),
      retrieveTime = new Date().getTime();
  users.findAndModify({email: email},[],
    {$set: {
      retrieveKey: retrieveKey,
      retrieveTime: retrieveTime
    }},
    function(err, userInfo){
    if(err){
      log.error(err.toString());
      if(err.toString().indexOf("No matching object found")===-1){
		    return res.render("error", { message:"数据获取失败，请稍后再试"});
      }else{
		    return res.render("error", { message:"email未被注册"});      
      }      
    }else{
      if(!userInfo){
		    return res.render("error", { message:"email未被注册"});      
      }else{
        var link = config.retrieveLink+"?p="+retrieveKey+"&e="+email;
        var nickName = email.split('@')[0];
       	var codeHtml = "<a href="+link+">"+link+"</a>";
       	mails.push({
          sender: 'CNAE <heyiyu.deadhorse@gmail.com>',
          to : nickName + " <"+email + ">",
          subject: config.retrieveMailTitle,
          html: config.retrieveMailContent+codeHtml,
          debug: true
       	});
      	mailEvent.fire("getMail");
        return res.redirect("/retrieveTips");
      }
    }
  })
}

exports.showRetrieveTips = function(req, res){
  return res.render("retrieveTips");
}

exports.showResetPassword = function(req, res){
  var queryString = urlMoudle.parse(req.url, true).query,
      email = queryString.e||'',
      key = queryString.p||'';
  users.findOne({email:email, retrieveKey:key}, function(err, data){
    if(err){
      log.error(err.toString());
      return res.render("error", {message:"数据获取失败，请稍后再试"});
    }else{
      if(!data){
        return res.render("error", {message:"错误的链接"});
      }else{
        var now = new Date().getTime(),
            oneDay = 1000*60*60*24;
        if(!data.retrieveTime || now - data.retrieveTime >oneDay){
          return res.render("error", {message:"该链接已过期，请重新申请"});
        }else{
          return res.render("resetPassword",{email:email});
        }
      }
    }
  })
}
exports.resetPassword = function(req, res){
  var email = req.body.email||'',
      password = req.body.changePassword||'',
      con = req.body.changeConfirmation||'';
	var regPass = /^(\w){6,20}$/;
  if(!regPass.exec(password)){
    return res.render("error", {
      message: "密码必须为6～20位字母、数字或下划线"
    });
	}else{
		if (con && password !== con) {
      return res.render("error", {
        message: "密码必须为6～20位字母、数字或下划线"
      });
    }
    else {
      users.findAndModify({
        email: email
      }, [], {
        $set: {
          password: md5(password+config.md5_secret),
          retrieveKey: undefined,
          retrieveTime: undefined
        }
      }, function(err){
        if (err) {
          log.error(err.toString());
          return res.render("error", {
            message: "密码修改错误"
          });
        }
        else {
          return res.redirect("/login");
        }
      });
    }
	}
}