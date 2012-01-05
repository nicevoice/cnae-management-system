var config = require('../config'), 
    log = config.logWithFile, 
    EventProxy = require('EventProxy.js').EventProxy,
    urlMoudle = require('url'),
    //models    
    model = require('../models/index'), 
    collectionNames = config.dbInfo.collections, 
    user = collectionNames.user,
    app_mem = collectionNames.app_member, 
    app_basic = collectionNames.app_basic, 
    app_record = collectionNames.app_record, 
    find = model.find, 
    findOne = model.findOne, 
    insert = model.insert, 
    update = model.update, 
    remove = model.remove, 
    count = model.count, 
    //send emails 
    sendMail = require('../lib/sendMail'), 
    mail = config.mail,
    mails = sendMail.mails, 
    mailEvent = sendMail.mailEvent,
    //utils
    verify = require('../lib/utils').verify;
    
exports.getAllApps = function(req, res){
  var domain = req.params.id;  
  find(app_mem, {
    email : req.session.email,
    active : 1
  }, {
    appDomain : 1,
    appName : 1
  }, {
    sort : [['role', 1], ['joinTime', 1]]
  }, function(err, apps) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status:"error",
        msg : "查询数据库错误"
      });
    }
    return res.sendJson({
      status:"ok",
      content:{
        apps : apps,
      }
    });
  });
}


//应用设置


exports.appmng = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
    return res.render("appManageInfo", {
      layout : "layoutApp",
      nickName : req.session.nickName,
      url : url,
      email : req.session.email
    });
}




exports.loadAppmng = function(req, res) {
  var domain = req.params.id || '';
  findOne(app_basic, {
    appDomain : domain.toString()
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "数据库查询错误"
      });
    } else {
      return res.sendJson({
        status: "ok",
        content:{
          appInfo:data
        }
      });
    }
  })
}

/***
 * 处理修改应用信息请求
 * @param {} req
 * @param {} res
 */
exports.doAppmng = function(req, res) {
  var domain = req.params.id || '';
  var body = req.body,
      newAppName = body.newAppName || '',
      newAppDes = body.newAppDes || '',
      newGithub = body.newGithub || '',
      newImgSource = body.newImgSource||'';
  
  if(!newAppName) {
    res.sendJson({
      status : "error",
      msg:"请输入应用名称"
    });
  } else {
    if(newAppName.length > 20) {
      newAppName = newAppName.slice(0, 20);
    }
    var newAppDes = req.body.newAppDes || '';
    if(newAppDes.length > 100) {
      newAppDes = newAppDes.slice(0, 100);
    }
    if(newGithub && !verify('githubPage', newGithub)){
      return res.sendJson({
        status:"error",
        msg:"github地址不正确"
      });   
    }
    if(newImgSource && !verify('imgSource', newImgSource)){
      return res.sendJson({
        status:"error",
        msg:"图片地址不正确"
      });   
    }  
    var updateInfoEvent = new EventProxy();
    updateInfoEvent.assign("updatedBasic", "updatedMem", "saveRecords", function() {
      if(!arguments[0] || !arguments[1] || !arguments[2]) {
        res.sendJson({
          status : "error",
          msg:"数据库更新失败，请稍后再试"
        });
      } else {
        res.sendJson({
          status : "ok"
        });
      }
    })
    update(app_basic, {
      appDomain : domain.toString()
    }, {
      $set : {
        appName : newAppName.toString(),
        appDes : newAppDes.toString(),
        github : newGithub.toString(),
        imgSource : newImgSource.toString()
      }
    }, function(err) {
      if(err) {
        log.error(err.toString());
        updateInfoEvent.fire("updatedBasic", false);
      } else
        updateInfoEvent.fire("updatedBasic", true);
    });
    update(app_mem, {
      appDomain : domain.toString()
    }, {
      $set : {
        appName : newAppName.toString()
      }
    }, {
      multi : true
    }, function(err) {
      if(err) {
        log.error(err.toString());
        updateInfoEvent.fire("updatedMem", false);
      } else
        updateInfoEvent.fire("updatedMem", true);
    });
    insert(app_record, {
      appDomain : domain.toString(),
      email : req.session.email.toString(),
      action : "修改应用信息",
      recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        updateInfoEvent.fire("saveRecords", false);
      } else {
        updateInfoEvent.fire("saveRecords", true);
      }
    });
  }
}


//成员管理
exports.coopmng = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManageCoop", {
    layout : "layoutApp",
    url : url,
    nickName : req.session.nickName,
    email : req.session.email
  });
};


exports.loadCoopmng = function(req, res){
  var domain = req.params.id;
  var coopEvent = new EventProxy();
  coopEvent.assign("getMems", "getOwn", function(mems, own) {
    if(!mems||!own){
      return res.sendJson({
        status:"error",
        msg:"数据库查询错误"
      });
    }else{
      return res.sendJson({
        status:"ok",
        content:{
          mems : mems,
          own : own,
        }
      });
    }
  });
  find(app_mem, {
    appDomain : domain
  }, {
    sort : [['joinTime', 1]]
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      coopEvent.fire("getMems", false);
    } else {
      coopEvent.fire("getMems", data);
    }
  });
  findOne(app_mem, {
    appDomain : domain,
    email : req.session.email
  }, function(err, data) {
    if(err) {
      log.error(err.toString());
      coopEvent.fire("getOwn", false);
    } else {
      coopEvent.fire("getOwn", data);
    }
  });  
}

/***
 * 处理添加合作者请求
 * @param {} req
 * @param {} res
 */
exports.doCoopmng = function(req, res) {
  var email = req.body.inviteEmail || '',
      words = req.body.inviteWords || '',
      role = req.body.role, 
      domain = req.params.id;
  role = parseInt(role);
  if(role!==1&&role!==2&&role!==3&&role!==4){
      return res.sendJson({
        status:"error",
        msg:"错误的角色信息"
      })
    }
  //未输入
  if(!email) {
    return res.sendJson({
      status : "error",
      msg : "请输入邮箱"
    })
  } else
  //输入不合法
  if(!verify('email', email)) {
    return res.sendJson({
      status : "error",
      msg : "请输入正确的email地址"
    })
  } else
  //输入自身
  if(email === req.session.email) {
    return res.sendJson({
      status : "error",
      msg : "不能邀请自己"
    });
  } else {
    findOne(app_mem, {
      email : email,
      appDomain : domain
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        return res.sendJson({
        status : "error",
          msg : "数据库查询错误"
        });
      } else if(data) {
        return res.sendJson({
        status : "error",
          msg : "不能邀请已参加用户"
        });
      } else {
        //插入
        findOne(app_basic, {
          appDomain : domain
        }, function(err, name) {
          if(err) {
            log.error(err.toString());
            res.sendJson({
         status : "error",
              msg : "数据库查询错误，请稍后再试"
            });
          } else if(name) {
            insert(app_mem, {
              appDomain : domain.toString(),
              appName : name.appName.toString(),
              email : email.toString(),
              role : role,
              active : 0,
              joinTime : new Date().getTime()
            }, function(err) {
              if(err) {
                log.error(err.toString());
                res.sendJson({
            status : "error",
                  msg : "数据库查询错误，请稍后再试"
                });
              } else {
                  var inviteNickName = email.split('@')[0];
								  mails.push({
								    sender : mail.sender,
								    to : inviteNickName + " <" + email + ">",
								    subject : mail.coopMailTitle,
								    html : mail.coopMailContent + words,
								    debug : true
								  });
								  mailEvent.fire("getMail");
                  res.sendJson({
              status : "ok",
                  domain : domain,
                  role : role
                });
                insert(app_record, {
                  appDomain : domain.toString(),
                  email : req.session.email.toString(),
                  action : "邀请成员:" + email,
                  recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
                }, function() {
                });
              }
            });
          }
        });
      }
    });
  }
}
/***
*  查询所有用户，输入提示时用
*/
exports.getEmails = function(req, res){
  var qs = urlMoudle.parse(req.url, true).query,
      emailMatch = decodeURIComponent(qs.emailMatch||''),
      limit = parseInt(decodeURIComponent(qs.limit||''));
      console.log(emailMatch, limit);
  if(!emailMatch||emailMatch.length < 3){
    return res.sendJson({status:"error", msg:"input too short"})
  }
  var options = {};
  if(limit){
    options.limit = limit;
  }
  find(user, {email:new RegExp(emailMatch)}, {email:1}, options, function(err, data){
    if(err){
      log.error(err.toString());
      return res.sendJson({status:"error", msg:"db error"});
    }
    // var emails = [];
    // for(var i=0, len=data.length; i!=len; ++i){
    //   emails.push(data[i].email);
    // }
    res.sendJson({status:"ok", emails:data});
  })
}
/***
 * 处理删除合作者请求
 * @param {} req
 * @param {} res
 */
exports.deleteCoop = function(req, res) {
  var email = req.body.email || '';
  var domain = req.params.id || '';
  if(!email)
    res.sendJson({
      done : false
    });
  else {
    remove(app_mem, {
      email : email,
      appDomain : domain
    }, function(err) {
      if(err) {
        log.error(err.toString());
        res.sendJson({
          done : false
        });
      } else {
        res.sendJson({
          done : true
        });
        insert(app_record, {
          appDomain : domain.toString(),
          email : req.session.email.toString(),
          action : "删除成员:" + email,
          recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
        }, function() {
        });
      }
    });
  }
}
exports.agreeCoop = function(req, res) {
  var email = req.body.email || '';
  var domain = req.params.id || '';
  update(app_mem, {
    appDomain : domain,
    email : email
  }, {
    $set : {
      active : 1,
      role : 3
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
    status:'error',
    msg:'数据库更新失败，请稍后再试'
      });
    } else {
      var nickName = email.split('@')[0], agreeInfo = req.session.nickName + '( ' + req.session.email + ' )同意了您对项目"' + domain + '"的参与申请。';
      mails.push({
        sender :mail.sender,
        to : nickName + " <" + email + ">",
        subject : mail.agreeMailTitle,
        html : mail.agreeMailContent + agreeInfo,
        debug : true
      });
      mailEvent.fire("getMail");
      insert(app_record, {
        appDomain : domain.toString(),
        email : req.session.email.toString(),
        action : "同意" + email + "参与应用",
        recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
      }, function() {
      });
      return res.sendJson({
        status:"ok"
      });
    }
  })
}
exports.refuseCoop = function(req, res) {
  var email = req.body.email || '';
  var domain = req.params.id || '';
  var reason = req.body.reason || '';
  remove(app_mem, {
    appDomain : domain,
    email : email
  }, function(err) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
    status:'error',
    msg:'数据库更新失败，请稍后再试'
      });
    } else {
      var nickName = email.split('@')[0],
      refuseReason = req.session.nickName + '( ' + req.session.email + ' )拒绝了您对项目"' + domain + '"的参与申请。<br />拒绝原因：' + reason;
      mails.push({
        sender : mail.sender,
        to : nickName + " <" + email + ">",
        subject : mail.refuseMailTitle,
        html : mail.refuseMailContent + refuseReason,
        debug : true
      });
      mailEvent.fire("getMail");
      return res.sendJson({
        status:"ok"
      });
    }
  })
}
exports.doChangeRole = function(req, res) {
  var email = req.body.email || '', domain = req.params.id || '', role = req.body.role || '';
  role = parseInt(role);
  if(role!==1&&role!==2&&role!==3&&role!==4){
      res.sendJson({
        status:"error",
        msg:"错误的角色信息"
      })
    }  
  update(app_mem, {
    email : email,
    appDomain : domain
  }, {
    $set : {
      role : role
    }
  }, function(err) {
    if(err) {
      log.error(err.toString());
      res.sendJson({
      status:"error",
      msg:"数据库更新失败，请稍后再试"
      });
    } else {
      res.sendJson({
        status:'ok'
      });
      var roleName = "";
      switch(parseInt(role)) {
        case 0:
          roleName = "创建者";
          break;
        case 1:
          roleName = "管理者";
          break;
        case 2:
          roleName = "参与者";
          break;
        case 3:
          roleName = "观察者";
          break;
      }
      insert(app_record, {
        appDomain : domain.toString(),
        email : req.session.email.toString(),
        action : "修改" + email + "角色至" + roleName,
        recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
      }, function() {
      });
    }
  })
}
/***
 * 显示管理记录
 * @param {} req
 * @param {} res
 */
exports.mnglog = function(req, res) {
  var url = req.url;
  var page = urlMoudle.parse(url, true).query.page || '1';
  var totalPage, pageNum = 10;
  url = url.slice(0, url.lastIndexOf('/'));
    return res.render("appManageRecord", {
      layout : "layoutApp",
      nickName : req.session.nickName,
      url : url,
      email : req.session.email
    });
};

exports.loadMnglog = function(req, res) {
  var domain = req.params.id || '';
  var url = req.url;
  var page = urlMoudle.parse(url, true).query.page || '1';
  var totalPage, pageNum = 10;
  count(app_record, {
    appDomain : domain.toString()
  }, function(err, count) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status : "error",
        msg : "数据库查询错误"
      });
    } else {
      totalPage = Math.ceil(count / pageNum);
      find(app_record, {
        appDomain : domain
      }, {
        sort : [['recordTime', -1]],
        skip : pageNum * (page - 1),
        limit : pageNum
      }, function(err, data) {
        if(err) {
          log.error(err.toString());
          return res.sendJson({
            status : "error",
            msg : "数据库查询错误"
          });
        } else {
          return res.sendJson({
            status : "ok",
            content : {
              records : data,
              pages : totalPage,
              page : page,
            }
          });
        }
      })
    }
  })
};




exports.addRecord = function(req, res) {
  var action = req.body.action || '', domain = req.params.id || '';
  insert(app_record, {
    appDomain : domain.toString(),
    email : req.session.email.toString(),
    action : action,
    recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
  }, function() {
    res.sendJson({});
  });
}