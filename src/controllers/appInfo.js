var onOff = require('../lib/utils').onOff
  , model = require('../models/index')
  , config = require('../config')
  , log = config.logWithFile
  , collectionNames = config.dbInfo.collections
  , app_mem = collectionNames.app_member
  , app_basic = collectionNames.app_basic
  , find = model.find
  , findOne = model.findOne
  , update = model.update;
  
  exports.sum = function(req, res){
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
  return res.render("appManageSum", {
    layout : "layoutApp",
    url : url,
    nickName : req.session.nickName,
    email : req.session.email,
    csrf: req.session._csrf
  });
  }

	exports.loadSumContent = function(req, res){
	var domain = req.params.id;
	findOne(app_basic, {appDomain:domain}, function(err, data){
		if(err){
			log.error(err.toString());
			return res.sendJson({status:"error", msg:"数据库查询错误"});
		}
		else if(data){
			return res.sendJson({status:"ok", content:{appName:data.appName,appDes:data.appDes,
			dbType:data.appDbType, dbName:data.appDbName, appDbPort:config.appDb.port}});
		}
		else{
      return res.sendJson({status:"error", msg:"未找到应用"});
		}
	});		
	}

exports.doControlApp = function(req, res){
	var domain = req.params.id,
		action = req.body.action,
    type = req.body.type || 'dev';
		if(action!=="start"&&action!=="stop"&&action!=="restart"&&action!=="pub"){
		  return res.sendJson({status:"error", msg:"命令错误"});
		}
  log.info(req.session.email + " " + domain + " " + action);
  var port = type==='online' ? config.socketPortOnline : config.socketPort;
	onOff(action, domain, function(data){
		res.sendJson( data);
	}, port);
}

exports.getStatus = function(req, res){
  var domain = req.params.id||'',
  savePort = req.body.savePort||'',
  appDomain = domain + config.toplevelDomain;
  onOff("status", domain, function(socketRes){
    var status = {};
    if(socketRes.status!=="ok"){
       status={rss:"", heap:"",uptime:"",
       last:"",pid:"",autorun:"",running:"", ports:[]};
    }else{
       status = socketRes.msg;
       status.last = new Date(status.last).format("MM/dd  hh:mm:ss");
    }
    status.appDomain = appDomain;
    var ports = status.ports;
    if(savePort&&ports&&ports[0]){
      update(app_basic, {appDomain:domain.toString()}, {$set:{port:ports[0]}},function(err){
        if(err){
            log.error(err.toString());
        }
      });
    }
    return res.sendJson(status);
  }, config.socketPortOnline)
}
