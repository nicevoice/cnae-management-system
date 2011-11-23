var config = require('../config')
  , exec  = require('child_process').exec
  , model = require('../models/index')
  , log = config.logWithFile
  , collectionNames = require('../config').dbInfo.collections
  , user = collectionNames.user
  , app_basic = collectionNames.app_basic
  , count = model.count
  , EventProxy = require('EventProxy.js').EventProxy;
  
exports.show = function(req, res){
    res.render('monitor', {
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
    countUser(proxy);
    countApp(proxy);
    checkSys(proxy);
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
