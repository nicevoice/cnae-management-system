var config = require('../config')
  , exec  = require('child_process').exec
  , model = require('../models/index')
  , log = config.logWithFile
  , collectionNames = require('../config').dbInfo.collections
  , user = collectionNames.user
  , app_basic = collectionNames.app_basic
  , count = model.count
  , EventProxy = require('EventProxy.js').EventProxy
  , httpReq = require('../lib/httpReq').httpReq
  , httpOptions = config.monitor;
  
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
        function clone(obj){
    var newObj = {};
    Object.keys(obj).forEach(function(key){
        newObj[key] = obj[key]
    });
    return newObj;
}        errors.push(err.toString());
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

/**
 * clone a object
 */
function clone(obj){
    var newObj = {};
    Object.keys(obj).forEach(function(key){
        newObj[key] = obj[key]
    });
    return newObj;
}

exports.getStatus = function(req, res, next){
    var options = clone(httpOptions);
    options.path = '/status';
    options.method = 'GET';
    httpReq(options, function(result){
        res.sendJson(result);
    })
};
exports.getList = function(req, res, next){
    var options = clone(httpOptions);
    options.path = '/apps';
    options.method = 'GET';
    httpReq(options, function(result){
        res.sendJson(result);
    })
};
exports.getDetailList = function(req, res, next){
    var options = clone(httpOptions);
    options.path = '/apps_detail';
    options.method = 'GET';
    httpReq(options, function(result){
        res.sendJson(result);
    })
};
exports.getAppStatus = function(req, res, next){
    var appname = null;
    if(req.params){
        appname = req.params.appname;
    }
    if(!appname){
        return res.sendJson({"status": "failure", "message": "url is invalid"})
    }
    var options = clone(httpOptions);
    options.path = '/app/'+appname;
    options.method = 'GET';
    httpReq(options, function(result){
        res.sendJson(result);
    })
};

exports.getAppLog = function(req, res, next){
    var appname = null, type = null, line = null;
    if(req.params){
        appname = req.params.appname;
        type = req.params.type;
        line = req.params.line;
    }
    if(!appname || !type || !line){
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end('{"status": "failure", "message": "url is invalid"}\n');
    }
    var options = clone(httpOptions);
    options.path = '/app_log/'+type+'/'+appname+'/last/'+line;
    options.method = 'GET';
    httpReq(options, function(result){
        res.sendJson(result);
    })    
};
exports.run = function(req, res, next){
    var appname = null;
    if(req.params){
        appname = req.params.appname;
    }
    if(!appname){
        return res.sendJson({"status": "failure", "message": "url is invalid"})    
    }
    var options = clone(httpOptions);
    options.path = '/app/'+appname+'/run';
    options.method = 'POST';
    httpReq(options, function(result){
        res.sendJson(result);
    })    
};
exports.stop = function(req, res, next){
    var appname = null;
    if(req.params){
        appname = req.params.appname;
    }
    if(!appname){
        return res.sendJson({"status": "failure", "message": "url is invalid"})    
    }
    var options = clone(httpOptions);
    options.path = '/app/'+appname+'/stop';
    options.method = 'POST';
    httpReq(options, function(result){
        res.sendJson(result);
    }) 
};

exports.query = function(req, res) {
    var queryString = req.body.queryString.trim() || '';
    queryString = "\"" + queryString + "\"";
    var command = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/checkDb.sh " + " " + queryString;
    exec(command, function(err, stdout, stderr) {
        if(err) {
            log.error(err.toString());
            return res.sendJson({
                status : "error",
                msg : "查询数据库失败"
            });
        } else {
            return res.sendJson({
                status : "ok",
                output : stdout
            });
        }
    })
}

