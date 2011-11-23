var config = require('../config')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , randomString = require('../lib/randomString')
  , model = require('../models/index')
  , log = config.logWithFile
  , collectionNames = require('../config').dbInfo.collections
  , user = collectionNames.user
  , app_mem = collectionNames.app_member
  , app_basic = collectionNames.app_basic
  , app_record = collectionNames.app_record
  , find = model.find
  , findOne = model.findOne
  , update = model.update
  , insert = model.insert
  , EventProxy = require('EventProxy.js').EventProxy
  , exec  = require('child_process').exec  
  , uploadDir = config.uploadDir
  , randomStringNum = require('../lib/randomString').getRandomStringNum;
  
exports.show = function(req, rse){
    res.render('admin', {
        layout:'layoutMain',
        nickName:req.session.nickName,
        email:req.session.email
    });
}

exports.load = function(req ,res){
    var proxy = new EventProxy();
    proxy.once('users', 'apps', 'appInfo', function(users, apps, appInfo){
        if(users===false||apps===false||appInfo===false){
            return res.sendJson({
                status:'error'
            })
        }
        res.sendJson({
            status:'ok',
            userNum:arguments[0],
            appNum:arguments[1],
            appInfo:arguments[2]
        })
    })
    countUser();
    countApp();
    checkSys();
}
function countUser(proxy){
    count(user, {}, function(err, count){
        if(count){
            proxy.fire('users', count);
        }else{
            proxy.fire('users', false);
        }
    });
}
function countApp(proxy){
    count(app_basic, {}, function(err, count){
        if(count){
            proxy.fire('apps', count);
        }else{
            proxy.fire('apps', false);
        }
    });
}
function checkApp(proxy){
    exec('../shells/appInfo.sh cnode-app-engine', function(err, stdout, stderr){
        if(stdout){
            proxy.fire('appInfo', stdout);
        }else{
            proxy.fire('appInfo', false);
        }
    })
}
