var config = require('../config'), 
    sendMail = require('../lib/sendMail'), 
    model = require('../models/index'), 
    log = config.logWithFile, 
    collectonNames = config.dbInfo.collections, 
    app_mem = collectonNames.app_member, 
    app_basic = collectonNames.app_basic, 
    app_record = collectonNames.app_record, 
    find = model.find, 
    findOne = model.findOne, 
    insert = model.insert, 
    update = model.update, 
    remove = model.remove, 
    count = model.count, 
    EventProxy = require('EventProxy.js').EventProxy, 
    nodemailer = config.nodemailer, 
    mailContent = config.mailContent, 
    mailTitle = config.mailTitle, 
    mails = sendMail.mails, 
    mailEvent = sendMail.mailEvent, 
    urlMoudle = require('url');

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
  var newAppName = req.body.newAppName || '';
  var body;
  if(!newAppName) {
    res.sendJson({
      done : false
    });
  } else {
    if(newAppName.length > 20) {
      newAppName = newAppName.slice(0, 20);
    }
    var newAppDes = req.body.newAppDes || '';
    if(newAppDes.length > 100) {
      newAppDes = newAppDes.slice(0, 100);
    }
    var updateInfoEvent = new EventProxy();
    updateInfoEvent.assign("updatedBasic", "updatedMem", "saveRecords", function() {
      if(!arguments[0] || !arguments[1] || !arguments[2]) {
        res.sendJson({
          done : false
        });
      } else {
        res.sendJson({
          done : true
        });
      }
    })
    update(app_basic, {
      appDomain : domain.toString()
    }, {
      $set : {
        appName : newAppName.toString(),
        appDes : newAppDes.toString()
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
 * 发送邮件
 * @param {string} email 发送邮箱
 * @param {string} words 发送邀请语
 */
function send(email, words) {
  var inviteNickName = email.split('@')[0];

  mails.push({
    sender : 'NAE <heyiyu.deadhorse@gmail.com>',
    to : inviteNickName + " <" + email + ">",
    subject : mailTitle,
    html : mailContent + words,
    debug : true
  });
  mailEvent.fire("getMail");
}

/***
 * 处理添加合作者请求
 * @param {} req
 * @param {} res
 */
exports.doCoopmng = function(req, res) {
  var email = req.body.inviteEmail || '', words = req.body.inviteWords || '', role = req.body.role, domain = req.params.id, regEmail = config.regEmail; body;
  //未输入
  if(!email) {
    res.sendJson({
      done : false,
      why : "请输入邮箱"
    })
  } else
  //输入不合法
  if(!regEmail.exec(email)) {
    res.sendJson({
      done : false,
      why : "请输入合法的email地址"
    })
  } else
  //输入自身
  if(email === req.session.email) {
    res.sendJson({
      done : false,
      why : "不能邀请自己"
    });
  } else {
    findOne(app_mem, {
      email : email,
      appDomain : domain
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        return res.sendJson({
          done : false,
          why : "数据库查询错误"
        });
      } else if(data) {
        return res.sendJson({
          done : false,
          why : "不能邀请已参加用户"
        });
      } else {
        //插入
        findOne(app_basic, {
          appDomain : domain
        }, function(err, name) {
          if(err) {
            log.error(err.toString());
            res.sendJson({
              done : false,
              why : "数据库查询错误，请稍后再试"
            });
          } else if(name) {
            insert(app_mem, {
              appDomain : domain.toString(),
              appName : name.appName.toString(),
              email : email.toString(),
              role : parseInt(role),
              active : 0,
              joinTime : new Date().getTime()
            }, function(err) {
              if(err) {
                log.error(err.toString());
                res.sendJson({
                  done : false,
                  why : "数据库查询错误，请稍后再试"
                });
              } else {
                send(email, words);
                res.sendJson({
                  done : true,
                  domain : domain,
                  role : parseInt(role)
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
        done : false
      });
    } else {
      var nickName = email.split('@')[0], agreeInfo = req.session.nickName + '( ' + req.session.email + ' )同意了您对项目"' + domain + '"的参与申请。';
      mails.push({
        sender : 'NAE <heyiyu.deadhorse@gmail.com>',
        to : nickName + " <" + email + ">",
        subject : config.agreeMailTitle,
        html : config.agreeMailContent + agreeInfo,
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
        done : true
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
        done : false
      });
    } else {
      var nickName = email.split('@')[0], refuseReason = req.session.nickName + '( ' + req.session.email + ' )拒绝了您对项目"' + domain + '"的参与申请。<br />拒绝原因：' + reason;
      mails.push({
        sender : 'NAE <heyiyu.deadhorse@gmail.com>',
        to : nickName + " <" + email + ">",
        subject : config.refuseMailTitle,
        html : config.refuseMailContent + refuseReason,
        debug : true
      });
      mailEvent.fire("getMail");
      return res.sendJson({
        done : true
      });
    }
  })
}
exports.doChangeRole = function(req, res) {
  var email = req.body.email || '', domain = req.params.id || '', role = req.body.role || '';
  update(app_mem, {
    email : email,
    appDomain : domain
  }, {
    $set : {
      role : parseInt(role)
    }
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