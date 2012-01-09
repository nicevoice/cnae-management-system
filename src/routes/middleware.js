var connectUtils = require('connect').utils,
	  config = require('../config'),
	  labs = config.labs,
	  checkTBSession = require('../lib/utils').checkTBSession,
	  findOne = require('../models/index').findOne,
    app_mem = config.dbInfo.collections.app_member;

//路由中间件
exports.hasLogin = function(req, res, next){
	//如果session不存在，
	if(!req.session.email || !req.session.nickName){
        var urlEncode = encodeURIComponent('http://'+req.headers.host+req.url);
		if(labs){
			//检查session
			checkTBSession(req, function(httpRes){
				if(httpRes.status === 'false'){
					return res.redirect('/login?redirect_url='+urlEncode);
				}else{
					req.session.email = httpRes.taobao_nick;
					req.session.nickName = httpRes.taobao_nick;
					return next();
				}
			});
		}else{
			return res.redirect('/login?redirect_url='+urlEncode);
		}
	}else{	//如果session存在
		return next();
	}
}


exports.hasNotLogin = function(req, res, next){
	//如果session存在
	if(!req.session.email && !req.session.nickName){	
		return next();
	} else {
		return res.redirect("/application");
	}
}

//检测是否有权限访问这个应用
exports.checkAuth = function(req, res, next){
	var domain = req.params.id||"";
	var email = req.session.email||"";
	findOne(app_mem, {appDomain: domain.toString(), email:email.toString()},
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
		if(!data || data.active!==1){  //active===1为已加入
			return res.render("error", {message:"没有权限访问这个应用"});
		}else{
			next();
		}
	});
}

//检测是否有权限执行这个操作
exports.checkChangeAuth = function(role) {
  return function(req, res, next) {
  	var domain = req.params.id||'';
  	var email = req.session.email||'';
	findOne(app_mem, {appDomain: domain.toString(), email:email.toString()},
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
		if(!data || data.active===2){
			return res.render("error", {message:"没有权限访问这个应用"});
		}else{
			if(data.role>role||data.active!==1){
				return res.render("error", {message:"没有权限进行这个操作"});
			}else{
				next();
			}
		}
	});
  }
}

exports.isAdmin = function(req, res, next){
	var email = req.session.email||'';
	for(var i=0, len=config.admins.length; i!=len; ++i){
		if(email === config.admins[i])
		{
			return next();
		}
	}
	res.redirect("/application");
}

exports.downloadAuth = function(req, res, next){
	var domain = req.params.name||'';
	var email = req.session.email||'';
	domain = domain.slice(0,domain.lastIndexOf('_'));
	findOne(app_mem, {appDomain: domain.toString(), email:email.toString()},
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
			if(!data || data.active===2 || data.role>2){
				return next(new Error('没有权限进行这个操作'));
			}
		next();
	});	
}

exports.webCache = require('../lib/webcache')({maxAge:30000});
