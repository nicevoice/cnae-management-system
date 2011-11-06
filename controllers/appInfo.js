var onOff = require('../lib/socket').onOff
  , model = require('../models/index')
  , log = require('../config').logWithFile
  , app_mem = model.app_mem
  , app_basic = model.app_basic;
  
  exports.sum = function(req, res){
	var domain = req.params.id;
	var url = req.url;
	url = url.slice(0, url.lastIndexOf('/'));
	app_basic.findOne({appDomain:domain}, function(err, data){
		if(err){
			log.error(err.toString());
			return res.render("error",{message:"查询数据库错误，请稍后再试"});
		}
		else if(data){
      app_mem.find({email:req.session.email, active:1},{appDomain:1, appName:1}
      ,{sort:[['role',1], ['joinTime',1]]}
      ).toArray(function(err, apps){
        if(err){
          log.error(err.toString());
          return res.render("error",{message:"查询数据库错误，请稍后再试"});
        }
			return res.render("appManageSum", {layout:"layoutApp", url:url, domain:domain,appName:data.appName,appDes:data.appDes,
			dbType:data.appDbType, dbName:data.appDbName, nickName:req.session.nickName, email:req.session.email,apps:apps});
      });
		}
		else{
			return res.render("error", {message:"数据库不存在该应用"});
		}
	});
}

exports.doControlApp = function(req, res){
	var domain = req.params.id,
		action = req.body.action;
  console.log(req.session.email + " " + domain + " " + action);
	if(action === "上线"){
		action = "start";
	}else if(action==="下线"){
		action = "stop";
	}
	onOff(action, domain, function(data){
		res.sendJson( data);
	})
}

exports.getStatus = function(req, res){
	var domain = req.params.id||'',
      savePort = req.body.savePort||'';
	onOff("status", domain, function(socketRes){
		if(!socketRes || socketRes.msg){
			socketRes={rss:"", heap:"",uptime:"",
			last:"",pid:"",autorun:"",running:"", ports:[]};
		}else{
			socketRes.last = new Date(socketRes.last).format("MM/dd  hh:mm:ss");
		}
      var ports = socketRes.ports;
      if(savePort&&ports&&ports[0]){
      app_basic.update({appDomain:domain.toString()}, {$set:{port:ports[0]}},function(err){
        if(err){
          console.log(err.toString());
        }
      });
      }
		return res.sendJson( socketRes);
	})
	}
