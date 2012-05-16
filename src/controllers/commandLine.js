var config = require('../config'),
    log = config.logWithFile,
    urlMoudle = require('url'),
    step = require('../lib/step.js'),
    
    //utils
    utils = require('../lib/utils'),
    md5 = utils.hex_md5,
    getRandomString = utils.getRandomString,
    verify = utils.verify,
    tplReplace = utils.tplReplace,
    
    //model
    model = require('../models/index'),
    findOne = model.findOne,
    find = model.find,
    update = model.update,
    user = config.dbInfo.collections.user,
    app_mem = config.dbInfo.collections.app_member,

    //email
    sendMail = require('../lib/sendMail'),
    mails = sendMail.mails,
    mailEvent =sendMail.mailEvent,
    mail = config.mail;

var sendResult = function(res, status, code, msg) {
    return res.sendJson({
      status: status,
      code: code,
      msg: msg
    });
    }
    
exports.getToken = function(req, res) {
  var queryString = urlMoudle.parse(req.url, true).query;
  var email = queryString.email || '',
      password = queryString.password || '';
  if (!email) {
    return sendResult(res, 'error', 2, 'miss param : email');
  }
  if (!password) {

    return sendResult(res, 'error', 3, 'miss param : password');
  }
  email = decodeURIComponent(email);
  password = decodeURIComponent(password);
  if (!verify('email', email)) {
    return sendResult(res, 'error', 4, 'param error : email format error');
  }
  findOne(user, {
    email: email,
    password: md5(password + config.md5_secret)
  }, function(err, result) {
    if (err) {
      log.error(err.toString());
      return sendResult(res, 'error', 1, 'system error : database error');
    } else {
      if (!result || result.length === 0) {
        return sendResult(res, 'error', 5, "wrong email or password");
      }
      var newToken = getRandomString(30);
      update(user, {
        email: email
      }, {
        $set: {
          token: newToken
        }
      }, function(err) {
        if (err) {
          log.error(err.toString());
          return sendResult(res, 'error', 1, 'system error : database error');
        }
        return res.sendJson({
          status: 'ok',
          code: 0,
          token: newToken
        });
      })
    }
  })
}


exports.checkAuth = function(req, res) {
  var queryString = urlMoudle.parse(req.url, true).query;
  var email = queryString.email || '',
      appDomain = queryString.app || '',
      token = queryString.token || '';
  if (!email) {
    return sendResult(res, "error", 1, "missing params: email");
  } else if (!appDomain) {
    return sendResult(res, "error", 2, "missing params: app");
  } else if (!token) {
    return sendResult(res, "error", 3, "missing params: token");
  } else if (!verify('email', email)) {
    return sendResult(res, "error", 4, "email format error");
  } else {
    email = decodeURIComponent(email);
    appDomain = decodeURIComponent(appDomain);
    token = decodeURIComponent(token);
    findOne(user, {
      email: email,
      token: token
    }, function(err, user) {
      if (err) {
        return sendResult(res, "error", 5, "system error:database error");
        log.error(err.toString());
      } else {
        if (!user) {
          return sendResult(res, "error", 6, "check token error");
        } else {
          findOne(app_mem, {
            email: email,
            appDomain: appDomain,
            active: 1,
            role: {
              $lt: 3
            }
          }, function(err, mem) {
            if (err) {
              return sendResult(res, "error", 5, "system error:database error");
              log.error(err.toString());
            } else {
              if (!mem) {
                return sendResult(res, "error", 7, "you don't have the app's permission");
              } else {
                return res.sendJson({
                  status: "ok"
                });
              }
            }
          })
        }
      }
    })
  }
}
//msg of warn
var message = {
  1 : "内存占用过多，系统重启app。",
  2 : "内存占用过多，系统重启app失败。请检查app，并手动重启app。",
  11 : "内存占用过多，系统关闭app。请优化app，并手动启动app。",
  21 : "CPU占用过多，系统重启app。",
  22 : "CPU占用过多，系统重启app失败。请检查app，并手动重启app。",
  23 : "CPU占用过多，系统关闭app，请优化app，并手动启动app。"
}
exports.sendEmail = function(req, res, next){
  var queryString = urlMoudle.parse(req.url, true).query;
  var appDomain = decodeURIComponent(queryString.app || '');
  var psw = decodeURIComponent(queryString.psw || '');
  var msg = parseInt(decodeURIComponent(queryString.msg || ''));
  //check params
  if(!psw || psw !== config.commandLine.warnPsw || !appDomain || !msg){
    return sendResult(res, "error", 1, "T_T");
  }
  //check db
  step(
    function getUsers(app){
      find(app_mem, {"appDomain" : appDomain, "active" : 1}, 
      {"email" : 1, "appName" : 1, "notifyLevel" : 1}, this);
    },
    function send(err, users){
      if(err){
        return sendResult(res, "error", 2, "system error:database error");
      } 
      if(users.length===0){
        return sendResult(res, "error", 3, "Wrong app domain");
      }
      //get appName
      var appName = users[0].appName || '';
      //get all the emails
      var tos = [];
      for(var i=0, len=users.length; i!=len; ++i){
        var level = users[i].notifyLevel||0;
        if(level>msg){
          continue;
        }
        var email = users[i].email;
        var nick = email.split('@')[0];
        tos.push(nick + "<" + email + ">");
      }
      if(tos.length === 0){
        return res.sendJson({status:"ok", msg:"All users were ignored"})
      }
      tos = tos.join(', ');
      //send emails to these users
      mails.push({
        sender: mail.sender,
        to : tos,
        subject: mail.warnMailTitle,
        html: tplReplace(mail.warnMailContent, {
          "$appDomain$" : appDomain,
          "$appName$" : appName,
          "$msg$" : message[msg]
        }),
        debug: true
      });
      mailEvent.fire("getMail");
      res.sendJson({status:"ok", msg:"All users were notified"});
    }
  )
}
