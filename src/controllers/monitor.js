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
    var loadEvent = new EventProxy(),
        errors = [];
    loadEvent.assign('users', 'apps', 'appInfo', function(users, apps, appInfo){
        if(users===false||apps===false||appInfo===false){
            return res.sendJson({
                status:'error',
                msg:errors.join(',')
            })
        }
        res.sendJson({
            status:"ok",
            content:{
            	userNum:arguments[0],
            	appNum:arguments[1],
            	appInfo:arguments[2]
			}
        })
    })
    count(user, {}, function(err, count){
        if(count){
            loadEvent.fire('users', count);
        }else{
            if(err){
                log.error(err.toString());
                errors.push(err.toString());
            }
            loadEvent.fire('users', false);
        }
    });
    count(app_basic, {}, function(err, count){
        if(count){
            loadEvent.fire('apps', count);
        }else{
            if(err){
                log.error(err.toString());
                errors.push(err.toString());
            }
            loadEvent.fire('apps', false);
        }
    });
    var command = __dirname.slice(0, __dirname.lastIndexOf('/')+1) + "shells/appInfo.sh cnode-app-engine";
    exec(command, function(err, stdout, stderr){
        if(stdout){
            loadEvent.fire('appInfo', stdout);
        }else{
            if(err){
                log.error(err.toString());
                errors.push(err.toString());
            }
            loadEvent.fire('appInfo', false);
        }
    })
}
