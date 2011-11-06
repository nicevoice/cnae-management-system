var model = require('../models/index')
  , log = config.logWithFile
  , app_mem = model.app_mem
  , getLog = require('../lib/socket').getLog;
  
exports.applog = function(req, res){
	var url = req.url,
		domain = req.params.id||'';
	url = url.slice(0, url.lastIndexOf('/'));
       app_mem.find({email:req.session.email, active:1},{appDomain:1, appName:1}
      ,{sort:[['role',1], ['joinTime',1]]}
      ).toArray(function(err, apps){
        if(err){
          log.error(err.toString());
          return res.render("error",{message:"查询数据库错误，请稍后再试"});
        }
			return res.render("appLogManage", {layout:"layoutApp", url:url, nickName:req.session.nickName,
	email:req.session.email,domain:domain, apps:apps});
	});
};
exports.getStdOutput = function(req, res){
	var domain = req.params.id||'',
		action = req.body.action;
	getLog(action, domain, 1000, function(data){
		try{
    var lines = data.split('\n');
    if (lines&&lines.length>0) {
      lines.reverse();
      lines.shift();
      while(lines.length>0 && lines[0].indexOf("/home/admin/cnae/git/cnode-app-engine/lib/modules/net.js") !== -1){
        lines.shift();
      } 
      data = lines.join('\n');
    }
		return res.sendJson( {output:data});
		}catch(e){};
	});
}