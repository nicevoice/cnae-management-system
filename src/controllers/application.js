var fs = require('fs')
  , config = require('../config')
  , exec  = require('child_process').exec
  , log = config.logWithFile
  , urlMoudle = require('url')
  , EventProxy = require('EventProxy.js').EventProxy
  , uploadDir = config.uploadDir
    //models
  , model = require('../models/index')
  , collectionNames = config.dbInfo.collections
  , app_mem = collectionNames.app_member
  , app_basic = collectionNames.app_basic
  , app_record = collectionNames.app_record
  , user = collectionNames.user
  , find = model.find
  , findOne = model.findOne
  , findAndModify = model.findAndModify
  , insert = model.insert
  , remove = model.remove
  , update = model.update
  , count = model.count

  //utils
  , utils = require('../lib/utils')
  , onOff = utils.onOff
  , verify = utils.verify
  , doGit = utils.doGit;
  exports.showMainPage = function(req, res) {
    res.render('index', {
      layout : false
    });
  }
  /***
   * 显示主应用
   * @param {} req
   * @param {} res
   */
  exports.show = function(req, res) {
    res.render("main", {
      layout : "layoutMain",
      nickName : req.session.nickName,
      email : req.session.email
    });
  }

  exports.loadMainContent = function(req, res) {
    //查找数据库
    var getAppEvent = new EventProxy();
    //当获取到自己的应用和参与的应用之后，才进行页面跳转
    getAppEvent.assign("getOwns", "getOthers", function(owns, others) {
      if(!owns || !others)
        return res.sendJson({
          status : "error",
          msg : "数据库查询错误"
        });
      else
        return res.sendJson({
          status : "ok",
          content : {
            ownApps : owns,
            otherApps : others,
            switchs : config.switchs
          }
        });
    });
    //从app_mem中查找自己的应用
    find(app_mem, {
      email : req.session.email.toString(),
      role : 0
    }, {
      appDomain : 1,
      appName : 1
    }, {
      sort : [['joinTime', 1]]
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        getAppEvent.fire("getOwns", false);
      } else {
        getAppEvent.fire("getOwns", data);
      }
    });
    //从app_mem中===查找参与的应用
    find(app_mem, {
      email : req.session.email.toString(),
      role : {
        $ne : 0
      },
      active : {
        $ne : 2
      }
    }, {
      appDomain : 1,
      appName : 1,
      active : 1
    }, {
      sort : [['joinTime', 1]]
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        getAppEvent.fire("getOthers", false);
      } else {
        getAppEvent.fire("getOthers", data);
      }
    });
  }
  /***
   * 创建新应用
   * @param {} req
   * @param {} res
   * @return {}
   */
  var checkNewInfo = function(req){
    var newAppDomain = (req.body.appDomain || '').trim(),
        newAppName = (req.body.appName || '').trim(), 
        newAppDes = (req.body.appDes || '').trim(),
        newGithub = (req.body.github || '').trim(),
        newAppImage = (req.body.appImage || '').trim();
    var options = {
      status:'error'
    };
    if(!newAppName) {
      options.warn = 'noName';
      return options;
    }
    if(newGithub&&!verify('githubPage', newGithub)) {
      options.warn = 'githubErr';
      return options;
    }
    if(newAppImage&&!verify('imgSource', newAppImage)) {
      options.warn = 'imgErr';
      return options;
    }
    if(newAppName.length > 20) {
      req.body.newAppName = newAppName.slice(0, 20);
    }
    if(newAppDes.length > 100) {
      req.body.newAppDes = newAppDes.slice(0, 100);
    }
    if(!verify('domain', newAppDomain)){
      options.warn = 'domainErr';
      return options;
    }
    return null;
  }
  exports.createApp = function(req, res, next) {
    var result = checkNewInfo(req);
    if(result){
      return res.sendJson(result);
    }
    var newAppDomain = (req.body.appDomain || '').trim(),
        newAppName = (req.body.appName || '').trim(), 
        newAppDes = (req.body.appDes || '').trim(),
        newGithub = (req.body.github || '').trim(),
        newAppImage = (req.body.appImage || '').trim();
    var checkRepetition = new EventProxy();
    //检查域名是否重复，用户创建的应用数目是否达到上限
    checkRepetition.assign("checkDomain", "checkNumbers", function(goodDomain, checkNumbers) {
      if(goodDomain === 1)
        return res.sendJson({status:'error', warn:'domainRep'});
      if(checkNumbers === 1)
        return res.sendJson({status:'error', warn:'domainLimit'});

      if(goodDomain instanceof Error || checkNumbers instanceof Error) {
        return next((goodDomain instanceof Error)? goodDomain : checkNumbers);
      } else {
        var createAppEvent = new EventProxy();
        createAppEvent.assign("savedBasic", "savedMem", "saveRecord", function() {
          if(arguments[0] || arguments[1] || arguments[2]) {
            return next(arguments[0]?arguments[0]:(arguments[1]?arguments[1]:arguments[2]));
          }
          var saveDir = uploadDir + "/" + newAppDomain;
          var initFile = __dirname.slice(0, __dirname.lastIndexOf('/') + 1) + "init.tar.gz";
          fs.mkdir(saveDir, '777', function(err) {
            if(err) {
              log.error(err.toString());
            }
            if(!newGithub){ //如果没有输入github地址，就放例子
              var initFile = __dirname.slice(0, __dirname.lastIndexOf('/') + 1) + "init.tar.gz";
              exec('tar -xf ' + initFile + ' -C ' + saveDir, function(err) {
                if(err) {
                  log.error(err.toString());
                }
              });
            }else{//否则去github上取代码
                var project;
                if(newGithub[newGithub.length-1]==='/'){
                  project = newGithub.slice(19, -1);    
                }else{
                  project = newGithub.slice(19);    
                }
                findOne(user, {email:req.session.email}, function(err, data){
                  if(err){
                    log.error(err.toString());
                    return next(err);
                  }
                  var gitCommand = "";
                  if(data.github&&data.github.token){
                    gitCommand = 'git clone git@' + data.github.token + '.github.com:'+ project + '.git';
                  }else{
                    gitCommand = 'git clone git://github.com/' + project + '.git';
                  }
                  doGit(gitCommand, newAppDomain, function(){}, true);
              })
            }
            return res.sendJson({status:'ok'});
        })
      })
        //执行插入
        var now = new Date().getTime();
        insert(app_basic, {
          appDomain : newAppDomain.toString(),
          appName : newAppName.toString(),
          github: newGithub.toString(),
          imgSource:newAppImage.toString(),
          appDes : newAppDes.toString(),
          appState : 0,
          appCreateDate : now
        }, function(err) {
          if(err) {
            log.error(err.toString());
            createAppEvent.fire("savedBasic", err);
          } else {
            createAppEvent.fire("savedBasic");
          }
        });
        insert(app_mem, {
          appDomain : newAppDomain.toString(),
          appName : newAppName.toString(),
          email : req.session.email.toString(),
          role : 0,
          active : 1,
          joinTime : new Date().getTime()
        }, function(err) {
          if(err) {
            log.error(err.toString());
            createAppEvent.fire("savedMem", err);
          } else {
            createAppEvent.fire("savedMem");
          }
        });
        insert(app_record, {
          appDomain : newAppDomain.toString(),
          email : req.session.email,
          action : "创建应用",
          recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
        }, function(err, data) {
          if(err) {
            log.error(err.toString());
            createAppEvent.fire("saveRecord", err);
          } else {
            createAppEvent.fire("saveRecord");
          }
        })
      }
    })
    findOne(app_mem, {
      appDomain : newAppDomain.toString()
    }, function(err, item) {
      if(err) {
        log.error(err.toString());
        checkRepetition.fire("checkDomain", err);
      } else {
        if(item) {
          checkRepetition.fire("checkDomain", 1);
        }
        checkRepetition.fire("checkDomain");
      }
    });
    var isAdmin = false;
    for(var i = 0, len = config.admins.length; i < len; ++i) {
      if(req.session.email === config.admins[i]) {
        isAdmin = true;
        break;
      }
    }
    if(isAdmin) {
      checkRepetition.fire("checkNumbers");
    } else {
      count(app_mem, {
        email : req.session.email,
        role : 0
      }, function(err, data) {
        if(err) {
          log.error(err.toString());
          checkRepetition.fire("checkNumbers", err);
        } else if(data >= 10)
          checkRepetition.fire("checkNumbers", 1);
        else
          checkRepetition.fire("checkNumbers");
      });
    }
  }
  /***
   * 显示创建新应用页面
   * @param {} req
   * @param {} res
   */

  exports.showNewApp = function(req, res) {
    res.render("newApp", {
      layout : "layoutMain",
      nickName : req.session.nickName,
      email : req.session.email
    });
  }
  /**
  *  删除应用
  */
  exports.deleteApp = function(req, res) {
    var delDomain = req.body.domain || '';
    var body;
    if(!delDomain) {
      res.sendJson({
        status : "error",
        msg : "缺少参数应用子域名"
      });
    } else {
      findOne(app_mem, {
        appDomain : delDomain,
        email : req.session.email,
        role : 0
      }, function(err, data) {
        if(err) {
          return res.sendJson({
            status : "error",
            msg : "数据库查询错误"
          });
        } else if(!data) {
          return res.sendJson({
            status : "error",
            msg : "该应用不存在或没有权限删除此应用"
          });
        } else {
          var deleteEvent = new EventProxy();
          deleteEvent.assign("deletedBasic", "deletedMem", "deletedRecords", "deleteDir", "deleteDb", "deleteDirOnline", function() {
            if(!arguments[0] || !arguments[1] || !arguments[2] || !arguments[3] || !arguments[4] || !arguments[5])
              return res.sendJson({
                status : "error",
                msg : "删除应用错误"
              });
            else {
              return res.sendJson({
                status : "ok"
              });
            }
          });
          deleteEvent.once("deleteDb", function(deleteDb) {
            if(!deleteDb) {
              return deleteEvent.fire("deleteBasic", false);
            }
            remove(app_basic, {
              appDomain : delDomain
            }, function(err) {
              if(err) {
                log.error(err.toString());
                deleteEvent.fire("deletedBasic", false);
              } else {
                deleteEvent.fire("deletedBasic", true);
              }
            });
          });
          findOne(app_basic, {
            appDomain : delDomain
          }, function(err, data) {
            if(err) {
              log.error(err.toString());
              return deleteEvent.fire("deleteDb", false);
            }
            if(!data) {
              return deleteEvent.fire("deleteDb", false);
            }
            if(!data.appDbName) {
              deleteEvent.fire("deleteDb", true);
            } else {
              var shPath = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/mongoDeletor.sh";
              var args = [data.appDbName, config.appDb.port, config.appDbAdmin.userName, config.appDb.password];
              exec(shPath + ' ' + args.join(' '), {timeout:10000}, function(err) {
                if(err) {
                  log.error(err.toString());
                  deleteEvent.fire("deleteDb", false);
                } else {
                  deleteEvent.fire("deleteDb", true);
                }
              });
            }
          });
          remove(app_mem, {
            appDomain : delDomain
          }, function(err) {
            if(err) {
              log.error(err.toString());
              deleteEvent.fire("deletedMem", false);
            } else {
              deleteEvent.fire("deletedMem", true);
            }
          });
          remove(app_record, {
            appDomain : delDomain
          }, function(err) {
            if(err) {
              log.error(err.toString());
              deleteEvent.fire("deletedRecords", false);
            } else {
              deleteEvent.fire("deletedRecords", true);
            }
          });
          onOff("stop", delDomain, function() {
            exec('rm -rf ' + uploadDir + "/" + delDomain, function(err) {
              if(err) {
                log.error(err.toString());
                deleteEvent.fire("deleteDir", false);
              } else {
                deleteEvent.fire("deleteDir", true);
              }
            });
          });
          onOff("stop", delDomain, function() {
            exec('rm -rf ' + config.onlineDir + "/" + delDomain, function(err) {
              if(err) {
                log.error(err.toString());
                deleteEvent.fire("deleteDirOnline", false);
              } else {
                deleteEvent.fire("deleteDirOnline", true);
              }
            }, config.socketPortOnline);
          });
        }
      })
    }
  }
  /***
   * 处理参加应用请求
   * @param {} req
   * @param {} res
   */
  exports.joinApp = function(req, res) {
    var domain = req.body.domain || '';
    if(!domain)
      res.sendJson({
        done : false
      });
    else {
      findAndModify(app_mem, {
        appDomain : domain,
        email : req.session.email
      },[], {
        $set : {
          active : 1
        }
      }, function(err, app) {
        if(err&&err.errmsg!=='No matching object found') {
          log.error(err.toString());
          return res.sendJson({
            done : false
          });
        }
        if(!app){
          return res.sendJson({
            done:false
          })
        }
        res.sendJson({
          done : true
        });
        insert(app_record, {
          appDomain : domain,
          email : req.session.email,
          action : "接受邀请",
          recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
        }, function() {
        });
      })
    }
  }
  /***
   * 处理退出应用请求
   * @param {} req
   * @param {} res
   */
  exports.deleteCoop = function(req, res) {
    var domain = req.body.domain || '';
    if(!domain)
      res.sendJson({
        done : false
      });
    else {
      remove(app_mem, {
        appDomain : domain,
        email : req.session.email
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
            appDomain : domain,
            email : req.session.email,
            action : "退出项目",
            recordTime : new Date().format("YYYY-MM-dd hh:mm:ss")
          }, function() {
          });
        }
      });
    }
  }
  /***
   * 检测域名是否被占用
   * @param {} req
   * @param {} res
   */
  exports.checkAppDomain = function(req, res) {
    var domain = urlMoudle.parse(req.url, true).query.domain || '';
    findOne(app_basic, {
      appDomain : domain
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        res.sendJson({});
      } else if(data)
        res.sendJson({
          warn : "域名已经被使用"
        });
      else
        res.sendJson({});
    })
  }
  /***
   * 处理权限查询请求
   * @param {} req
   * @param {} res
   */
  exports.getOwnAuthInfo = function(req, res) {
    var email = req.session.email || '',
        domain = urlMoudle.parse(req.url, true).query.domain||'';
    //查找权限
    findOne(app_mem, {
      appDomain : domain,
      email : email
    }, function(err, data) {
      if(err) {
        log.error(err.toString());
        return res.sendJson({
          status : "error",
          msg : "数据库查询错误"
        });
      } else {
        if(data)
          return res.sendJson({
            status : "ok",
            role : data.role,
            active : data.active
          });
        else
          return res.sendJson({
            status : "error",
            msg : "没有权限访问这个应用"
          });
      }
    });
  }
  /***
   * 当输入无效页面的时候，返回到主页面
   * @param {} req
   * @param {} res
   */
  exports.pageNotFound = function(req, res) {
    res.redirect("/application");
  }
