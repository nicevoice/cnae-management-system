var onOff = require('../lib/socket').onOff
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
    email : req.session.email
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
			dbType:data.appDbType, dbName:data.appDbName}});
		}
		else{
      return res.sendJson({status:"error", msg:"未找到应用"});
		}
	});		
	}

exports.doControlApp = function(req, res){
	var domain = req.params.id,
		action = req.body.action;
		if(action!=="start"&&action!=="stop"&&action!=="restart"){
		  return res.sendJson({status:"error", msg:"命令错误"});
		}
  console.log(req.session.email + " " + domain + " " + action);
	onOff(action, domain, function(data){
		res.sendJson( data);
	})
}

exports.getStatus = function(req, res){
	var domain = req.params.id||'',
      savePort = req.body.savePort||'',
      appDomain = domain + config.toplevelDomain;
	onOff("status", domain, function(socketRes){
		if(!socketRes || socketRes.msg){
			socketRes={rss:"", heap:"",uptime:"",
			last:"",pid:"",autorun:"",running:"", ports:[]};
		}else{
			socketRes.last = new Date(socketRes.last).format("MM/dd  hh:mm:ss");
		}
		socketRes.appDomain = appDomain;
      var ports = socketRes.ports;
      if(savePort&&ports&&ports[0]){
      update(app_basic, {appDomain:domain.toString()}, {$set:{port:ports[0]}},function(err){
        if(err){
          console.log(err.toString());
        }
      });
      }
		return res.sendJson( socketRes);
	})
	}