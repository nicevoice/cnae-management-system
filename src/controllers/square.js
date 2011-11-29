var config = require('../config')
  , urlMoudle = require('url')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , log = config.logWithFile
  , EventProxy = require('EventProxy.js').EventProxy  
  , uploadDir = config.uploadDir
  //models  
  , model = require('../models/index')
  , collectionNames = config.dbInfo.collections
  , user = collectionNames.user
  , app_mem = collectionNames.app_member
  , app_basic = collectionNames.app_basic
  , find = model.find
  , findOne = model.findOne
  , update = model.update
  , insert = model.insert
  //send emails
  ,sendMail = require('../lib/sendMail')
  ,mails = sendMail.mails
  ,mailEvent =sendMail.mailEvent
  ,mail = config.mail
  //utils
  , utils = require('../lib/utils')
  , randomStringNum = utils.getRandomStringNum 
  , md5 = utils.hex_md5;
  
exports.showSquare = function(req, res){
  return res.render("appSquare", {layout:"layoutMain",
      nickName:req.session.nickName, email:req.session.email});
}

exports.post = function(req, res){
  var queryString = urlMoudle.parse(req.url, true).query, skip = queryString.skip || '', limit = queryString.limit || '';
  find(app_basic, {}, { //找出最新的limit个应用
    sort: [['github', -1],['appCreateDate', -1]],
    skip: skip,
    limit: limit
  }, function(err, data){
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: "error",
        msg: "数据获取失败"
      });
    }
    else {
      if (!data || data.length <= 0) {
        return res.sendJson({
          status: "done",
          msg: "所有数据获取完成"
        });
      }
      var domainToMems = {}, domains = []; //domainToMems存放domain和mem的对应关系，用hash的形式， domains存放应用域名，便于app_mem查找
      for (var i = 0, len = data.length; i < len; ++i) {
        domains[i] = data[i].appDomain;
        domainToMems[domains[i]] = {};
        domainToMems[domains[i]].memberNums = 0;
      }
      find(app_mem, { //查找这limit个应用的参与者
        appDomain: {
          $in: domains
        }
      }, function(err, mems){
        if (err) {
          log.error(err.toString());
          return res.sendJson({
            status: "error",
            msg: "数据获取失败"
          });
        }
        else {
          var creatorEmails = [];
          for (var i = 0, len = mems.length; i < len; ++i) {
            if (mems[i].active === 1) {
              domainToMems[mems[i].appDomain].memberNums++; 
              if (mems[i].role === 0) {
                domainToMems[mems[i].appDomain].creatorEmail = mems[i].email;
                creatorEmails.push(mems[i].email);
              }
            }
          }
          for (var i = 0, len = data.length; i < len; ++i) {
            if (!domainToMems[data[i].appDomain]) {
              data[i].memberNums = "0";
              data[i].creatorEmail = "";
            }
            else {
              data[i].memberNums = domainToMems[data[i].appDomain].memberNums || 0;
              data[i].creatorEmail = domainToMems[data[i].appDomain].creatorEmail || "";
            }
          }          
          find(user, {
            email: {
              $in: creatorEmails
            }
          }, {
            email: 1,
            nickName: 1
          }, function(err, userInfos){
            if (err) {
              log.error(err.toString());
              return res.sendJson({
                status: "error",
                msg: "数据获取失败"
              });
            }
            else 
              if (!userInfos || userInfos.length === 0) {
                return res.sendJson({
                  status: "error",
                  msg: "数据获取失败"
                });
              }
              else 
                if (userInfos) {
                  var emailToNick = {};
                  for (var i = 0, len = userInfos.length; i < len; ++i) {
                    emailToNick[userInfos[i].email] = userInfos[i].nickName;
                  }
                  for (var i = 0, len = data.length; i < len; i++) {
                    if (emailToNick[data[i].creatorEmail]) {
                      data[i].creatorNickName = emailToNick[data[i].creatorEmail];
                      data[i].photoUrl = "http://www.gravatar.com/avatar/"+md5(data[i].creatorEmail||'');
                      data[i].appCreateDate = new Date(parseInt(data[i].appCreateDate)).format("YYYY-MM-dd hh:mm:ss");
                    }
                    else {
                      data[i].creatorNickName = "";
                    }
                  }
                  return res.sendJson({
                    status: "ok",
                    apps: data
                  });
                }
          })
        }
      });
    }
  })
} 

exports.apply = function(req, res){
  var domain = req.body.domain || '', 
      email = req.body.email || '', 
      appName = req.body.name || '', 
      nickName = req.body.nickName || '',
      reason = req.body.reason||'';
  var applyEvent = new EventProxy();
  applyEvent.assign("checkOwn", "checkTarget", function(checkOwn, checkTarget){
    if (checkOwn.status === "error") {
      return res.sendJson(checkOwn);
    }
    if (checkTarget.status === "error") {
      return res.sendJson(checkTarget);
    }
    insert(app_mem, {
      appDomain: domain,
      appName:appName,
      email: req.session.email,
      active: 2,
      joinTime:new Date().getTime()
    }, function(err){
      if (err) {
        log.error(err.toString());
        res.sendJson({
          status: "error",
          msg: "数据更新失败"
        });
      }
      else {
        var applyInfo = req.session.nickName + "( " + req.session.email + " )" +
        '申请加入您的项目"' +
        appName +
        '"。</br>申请理由：'+reason;
        var content = mail.applyMailTitle.replace('$domain$', domain);
        mails.push({
          sender: mail.sender,
          to: nickName + " <" + email + ">",
          subject: mail.applyMailTitle,
          html: content + applyInfo,
          debug: true
        });
        mailEvent.fire("getMail");
        res.sendJson({
          status: "ok"
        });
      }
    })
  })
  findOne(app_mem, {
    appDomain: domain,
    email: email
  }, function(err, data){
    if (err) {
      log.error(err.toString());
      applyEvent.fire("checkTarget", {
        status: "error",
        msg: "数据获取错误"
      });
    }
    else {
      if (!data || data.role !== 0) {
        applyEvent.fire("checkTarget", {
          status: "error",
          msg: "对方没有权限管理该应用"
        });
      }
      else {
        applyEvent.fire("checkTarget", {
          status: "ok"
        });
      }
    }
  });
  findOne(app_mem, {
    appDomain: domain,
    email: req.session.email
  }, function(err, data){
    if (err) {
      log.error(err.toString());
      applyEvent.fire("checkOwn", {
        status: "error",
        msg: "数据获取错误"
      });
    }
    else {
      if (!data || data.length === 0) {
        applyEvent.fire("checkOwn", {
          status: "ok"
        });
      }
      else {
        applyEvent.fire("checkOwn", {
          status: "error",
          msg: "已经参与该项目"
        });
      }
    }
  })
}
exports.showPersonalSquare = function(req, res){
  var nickName = req.url.slice(req.url.lastIndexOf("/")+1)||'';
  return res.render("personalSquare.html", {layout:"layoutMain", email:req.session.email, 
  nickName:req.session.nickName, ownerNickName:nickName});
}
exports.personalSquare = function(req, res){
  var queryString = urlMoudle.parse(req.url, true).query, skip = queryString.skip || '', limit = queryString.limit || '';
  var nickName = queryString.nickName || '';
  findOne(user, {
    nickName: nickName
  }, function(err, owner){
    if (err) {
      log.error(err.toString());
      return res.sendJson({
        status: error,
        msg: "获取数据失败"
      });
    }
    else {
      if (!owner) {
        return res.sendJson({
          status: "error",
          msg: "未找到该用户"
        });
      }
      else {
        var email = owner.email, ownDomain=[];
        find(app_mem, {
          email: email
        }, function(err ,mems){
          if (err) {
            log.error(err.toString());
            return res.sendJson({
              status: "error",
              msg: "获取数据失败"
            });
          }
          else {
            for(var i=0, len=mems.length; i<len; ++i){
                if (mems[i].active < 2) {
                  ownDomain.push(mems[i].appDomain);
                }
            }
            find(app_basic, {
              appDomain:{$in:ownDomain}
            }, { //找出该用户的应用
              sort: [['github', -1], ['appCreateDate', -1]]
            }, function(err, data){
              if (err) {
                log.error(err.toString());
                return res.sendJson({
                  status: "error",
                  msg: "数据获取失败"
                });
              }
              else {
                var domainToMems = {}, domains = []; //domainToMems存放domain和mem的对应关系，用hash的形式， domains存放应用域名，便于app_mem查找
                for (var i = 0, len = data.length; i < len; ++i) {
                  domains[i] = data[i].appDomain;
                  domainToMems[domains[i]] = {};
                  domainToMems[domains[i]].memberNums = 0;
                }
                find(app_mem, { //查找这他的应用的参与者
                  appDomain: {
                    $in: domains
                  }
                }, function(err, mems){
                  if (err) {
                    log.error(err.toString());
                    return res.sendJson({
                      status: "error",
                      msg: "数据获取失败"
                    });
                  }
                  else {
                    var creatorEmails = [];
                      for (var i = 0, len = mems.length; i < len; ++i) {
                        if (mems[i].active === 1) {
                          domainToMems[mems[i].appDomain].memberNums++;
                          if (mems[i].role === 0) {
                            domainToMems[mems[i].appDomain].creatorEmail = mems[i].email;
                            creatorEmails.push(mems[i].email);
                          }
                        }
                      }
                      for (var i = 0, len = data.length; i < len; ++i) {
                        if (!domainToMems[data[i].appDomain]) {
                          data[i].memberNums = "0";
                          data[i].creatorEmail = "";
                        }
                        else {
                          data[i].memberNums = domainToMems[data[i].appDomain].memberNums || 0;
                          data[i].creatorEmail = domainToMems[data[i].appDomain].creatorEmail || "";
                        }
                      }           
                      find(user, {
                        email: {
                          $in: creatorEmails
                        }
                      }, {
                        email: 1,
                        nickName: 1
                      }, function(err, userInfos){
                        if (err) {
                          log.error(err.toString());
                          return res.sendJson({
                            status: "error",
                            msg: "数据获取失败"
                          });
                        }
                        else 
                          if (!userInfos || userInfos.length === 0) {
                            return res.sendJson({
                              status: "error",
                              msg: "数据获取失败"
                            });
                          }
                          else 
                            if (userInfos) {
                              var emailToNick = {};
                              for (var i = 0, len = userInfos.length; i < len; ++i) {
                                emailToNick[userInfos[i].email] = userInfos[i].nickName;
                              }
                              for (var i = 0, len = data.length; i < len; i++) {
                                if (emailToNick[data[i].creatorEmail]) {
                                  data[i].creatorNickName = emailToNick[data[i].creatorEmail];
                                  data[i].photoUrl = "http://www.gravatar.com/avatar/"+md5(data[i].creatorEmail||'');
                                  data[i].appCreateDate = new Date(parseInt(data[i].appCreateDate)).format("YYYY-MM-dd hh:mm:ss");
                                }
                                else {
                                  data[i].creatorNickName = "";
                                }
                              }
                              return res.sendJson({
                                status: "ok",
                                apps: data,
                                owner:email
                              });
                            }
                      })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}
