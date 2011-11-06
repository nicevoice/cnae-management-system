var admins = require('../config').admins,
    app_mem = require('../models/index').app_mem;
//路由中间件


exports.hasLogin = function(req, res, next){
	//如果session不存在，
	if(!req.session.email || !req.session.nickName){
		return res.redirect("/login");
	}else{	//如果session存在
		return next();
	}
}


exports.hasNotLogin = function(req, res, next){
	//如果session存在
	if(!req.session.email || !req.session.nickName){
		return next();
	} else {
		return res.redirect("/");
	}
}

//检测是否有权限访问这个应用
exports.checkAuth = function(req, res, next){
	var domain = req.params.id||"";
	var email = req.session.email||"";
	app_mem.findOne({appDomain: domain.toString(), email:email.toString()},
	function(err , data){
		if(err){
			return res.render("error", {message:"数据库查询错误，请稍后再试"});
		}else
		if(!data || data.active===2){  //active===2为申请者
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
	app_mem.findOne({appDomain: domain.toString(), email:email.toString()},
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
	for(var i=0, len=admins.length; i!=len; ++i){
		if(email === admins[i])
		{
			return next();
		}
	}
	res.redirect("/");
}
