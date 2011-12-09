var connectUtils = require('connect').utils,
    admins = require('../config').admins,
	  labs = require('../config').labs,
	  checkTBSession = require('../lib/utils').checkTBSession,
	  findOne = require('../models/index').findOne,
    app_mem = require('../config').dbInfo.collections.app_member;

//路由中间件
exports.hasLogin = function(req, res, next){
	//如果session不存在，
	if(!req.session.email || !req.session.nickName){
        var urlEncode = encodeURIComponent(req.url);
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
	if(!req.session.email || !req.session.nickName){
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
	for(var i=0, len=admins.length; i!=len; ++i){
		if(email === admins[i])
		{
			return next();
		}
	}
	res.redirect("/");
}

var cache = {};

var INTERVAL = 10000;
function checkCache(){
  for(var key in cache){
    cache[key].t -= INTERVAL/1000;
    if(cache[key].t<0){
      delete cache[key];
    }
  }
}
setInterval(checkCache, INTERVAL);
var filter = function(req, res){
  var type = res.getHeader('Content-Type') || '';
  return type && type.match(/json|text|javascript/);
}
exports.webcache = function(options){
  options = options||{};
  options.maxAge = (options.maxAge||60000)/1000;
  options.filter = options.filter || filter;
  options.version = options.version||'';
  var nocacheFilter = options.nocacheFilter || null;
  
  return function(req ,res, next){
    if(nocacheFilter && nocacheFilter.test(req.url)){
      return next();
    }
    var key = req.url + options.version;
    var hit = cache[key]&&cache[key].v;
    var uacc = connectUtils.parseCacheControl(req.headers['cache-control'] || '');
    if(!uacc['no-cache'] && typeof hit==="string"){
//      console.log('hit');
      return res.end(hit);
    }
    
    res.on('header', function(){
      if(!options.filter(req, res)){
        return;
      }
      //check if no-cache
      var cc = connectUtils.parseCacheControl(res.getHeader('cache-control')||'');
      if(cc['no-cache'] || res.statusCode !== 200){
        return ;
      }
      //maxage
      var maxAge = 'max-age' in cc ? cc['max-age'] : options.maxAge;
      var chunks = '';
      //pach for write
      res.__write__ = res.write;
      
      res.write = function(chunk, encoding){
        res.__write__(chunk, encoding);
        if(Buffer.isBuffer(chunk)){
          chunks += chunk.toString();
        }else{
          chunks += chunk || '';
        }
      }
      var end =res.end;
      res.end = function(chunk, encoding){
        res.end = end;
        if(chunk){
          res.write(chunk, encoding);
        }
        res.end();
        cache[key] = {v:chunks, t:maxAge};
      }
    })
    next();
  }
}
