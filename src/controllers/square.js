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
/**
 * get square app infos
 */
exports.getSquareInfo = function(req, res) {
  var queryString = urlMoudle.parse(req.url, true).query, 
  skip = decodeURIComponent(queryString.skip || '').trim(), 
  limit = decodeURIComponent(queryString.limit || '').trim(), 
  nickName=decodeURIComponent(queryString.nickName || '').trim(),
  query = decodeURIComponent(queryString.query || '').trim(),
  isQuery = decodeURIComponent(queryString.isQuery || 'false').trim();
  //regist proxy
  var proxy = new EventProxy();
  var apps = [];//存放最终数据
  var ownerEmail; //存放owner email 
  //handle db error
  var _errorHandle = function(err) {
    proxy.removeAllListeners();
    log.error(err.toString());
    return res.sendJson({
      status : "error",
      msg : "数据获取失败"
    });
  }
  //寻找某个用户的应用时，先把用户相关联的应用域名找出来。
  //get email use nick 
  var _getEmail = function(){
    findOne(user, {
      nickName: nickName
      }, function(err, owner){
        if(err){
          _errorHandle(err);
        }else{
          if(!owner){
            return res.sendJson({
            status:"error",
            msg:"未找到该用户"
          });
          }
          ownerEmail = owner.email;
          proxy.fire('email_gotten', owner.email);          
        }
    })
  }
  //get appdomains in app_mem use email
  var _getAppDomain = function(email){
    var ownDomain = [];
    find(app_mem, {
      email: email
    }, function(err ,mems){
      if(err){
        _errorHandle(err);
      }else{
        for(var i=0, len=mems.length; i<len; ++i){
          if (mems[i].active < 2) {
            ownDomain.push(mems[i].appDomain);
          }        
        }
        proxy.fire('appDomain_gotten', ownDomain);
      }
    })    
  }
  //get apps
  var _getApps = function(ownDomain){
    var selector = {}, options = {};
    if(typeof ownDomain === 'object'){
      selector = {
        appDomain:{$in:ownDomain}
      }
      options = {
        sort: [['appCreateDate', -1]]       
      }
    }else if(isQuery === 'true') {
      selector = {appName : new RegExp(ownDomain)}
    } else {
      options = {//找出最新的limit个应用
        sort : [['appCreateDate', -1]],
        skip : skip,
        limit : limit
      }      
    }
    find(app_basic, selector, options, function(err, data) {
      if(err) {
        _errHandle(err);
      } else {
        apps = data;
        if(!apps || apps.length <= 0) {
          proxy.removeAllListeners();
          return res.sendJson({
            status : "done",
            msg : "所有数据获取完成"
          });
        }
        proxy.fire('apps_gotten', apps);
      }
    })
  }
  //根据app获取到mems
  var _getMems = function(apps) {
    var domainToMems = {}, domains = [];
    //domainToMems存放domain和mem的对应关系，用hash的形式， domains存放应用域名，便于app_mem查找
    for(var i = 0, len = apps.length; i < len; ++i) {
      domains[i] = apps[i].appDomain;
      domainToMems[domains[i]] = {};
      domainToMems[domains[i]].memberNums = 0;
    }
    find(app_mem, {
      appDomain : {
        $in : domains
      }
    }, function(err, mems) {
      if(err) {
        _errorHandle(err);
      } else {
        //获取到creator，同时记录下mem数目
        var creatorEmails = [];
        for(var i = 0, len = mems.length; i < len; ++i) {
          if(mems[i].active === 1) {
            domainToMems[mems[i].appDomain].memberNums++;
            if(mems[i].role === 0) {
              domainToMems[mems[i].appDomain].creatorEmail = mems[i].email;
              creatorEmails.push(mems[i].email);
            }
          }
        }
        //把数据记录到apps里面
        for(var i = 0, len = apps.length; i < len; ++i) {
          if(!domainToMems[apps[i].appDomain]) {
            apps[i].memberNums = "0";
            apps[i].creatorEmail = "";
          } else {
            apps[i].memberNums = domainToMems[apps[i].appDomain].memberNums || 0;
            apps[i].creatorEmail = domainToMems[apps[i].appDomain].creatorEmail || "";
          }
        }
        proxy.fire('creator_gotten', creatorEmails);
      }
    })
  }
  //获取creator信息
  var _getCreatorInfo = function(creatorEmails) {
    find(user, {
      email : {
        $in : creatorEmails
      }
    }, {
      email : 1,
      nickName : 1
    }, function(err, userInfos) {
      if(err) {
        _errorHandle(err);
      } else if(!userInfos || userInfos.length === 0) {
        _errorHandle(new Error("no such user in creatorEmails"));
      } else if(userInfos) {
        var emailToNick = {};
        for(var i = 0, len = userInfos.length; i < len; ++i) {
          emailToNick[userInfos[i].email] = userInfos[i].nickName;
        }
        for(var i = 0, len = apps.length; i < len; i++) {
          if(emailToNick[apps[i].creatorEmail]) {
            apps[i].creatorNickName = emailToNick[apps[i].creatorEmail];
            apps[i].photoUrl = "http://www.gravatar.com/avatar/" + md5(apps[i].creatorEmail || '');
            apps[i].appCreateDate = new Date(parseInt(apps[i].appCreateDate)).format("YYYY-MM-dd hh:mm:ss");
          } else {
            apps[i].creatorNickName = "";
          }
        }
        return res.sendJson({
          status : "ok",
          apps : apps,
          owner : ownerEmail
        });
      }
    })
  }
  //regist proxy
  if(nickName){//must get email & appDomain first
    _getEmail();
    proxy.once('email_gotten', _getAppDomain);
    proxy.once('appDomain_gotten', _getApps);
  }else {
    _getApps(query);
  }
  proxy.once('apps_gotten', _getMems);
  proxy.once('creator_gotten', _getCreatorInfo);
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
        var content = mail.applyMailContent.replace(/\$domain\$/g, domain);
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
    appName:appName,
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

exports.search = function(req, res, next) {
  var appName = req.body.searchName || '';
  if(!appName) {

  }
}
