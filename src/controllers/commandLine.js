var config = require('../config'),
    log = config.logWithFile,
    urlMoudle = require('url'), 
    //utils
    utils = require('../lib/utils'),   
    md5 = utils.hex_md5,
    getRandomString = utils.getRandomString,
    verify = utils.verify,
    //model
    model = require('../models/index'),
    findOne = model.findOne,
    update = model.update,    
    user = config.dbInfo.collections.user,
    app_mem = config.dbInfo.collections.app_member; 

var sendResult = function(res, status, code, msg){
    return res.sendJson({
        status:status,
        code:code,
        msg:msg
    });
}        
exports.getToken = function(req, res){
    var queryString = urlMoudle.parse(req.url, true).query;
    var email = queryString.email||'',
        password = queryString.password||'';
    if(!email){
       return sendResult(res, 'error', 2, 'miss param : email');
    }
    if(!password){

       return sendResult(res, 'error', 3, 'miss param : password');
    }    
    email = decodeURIComponent(email);
    password = decodeURIComponent(password);
    if(!verify('email', email)){
       return sendResult(res, 'error', 4, 'param error : email format error');
    }
    findOne(user, {email:email, password:md5(password+config.md5_secret)}, function(err, result){
        if(err){
            log.error(err.toString());
            return sendResult(res, 'error', 1, 'system error : database error');
        }else{
            if(!result||result.length===0){
            return sendResult(res, 'error', 5, "wrong email or password"); 
            }
            var newToken = getRandomString(30);
            update(user, {email:email}, {$set:{token:newToken}}, function(err){
                if(err){
                    log.error(err.toString());
                    return sendResult(res, 'error', 1, 'system error : database error');
                }
                return res.sendJson({
                    status:'ok',
                    code:0,
                    token:newToken
                });
            })
        }
    })
}


exports.checkAuth = function(req, res){
    var queryString = urlMoudle.parse(req.url, true).query;
    var email = queryString.email||'',
        appDomain = queryString.app||'',
        token = queryString.token||'';
    if(!email){
      return sendResult(res, "error", 1, "missing params: email");
    }else if(!appDomain){
        return sendResult(res, "error", 2, "missing params: app");
    }else if(!token){
        return sendResult(res, "error", 3, "missing params: token");
    }else if(!verify('email', email)){
        return sendResult(res, "error", 4, "email format error");
    }else{
    	  email = decodeURIComponent(email);
    	  appDomain = decodeURIComponent(appDomain);
    	  token = decodeURIComponent(token);
        findOne(user, {email:email, token:token}, function(err, user){
            if(err){
                return sendResult(res, "error", 5, "system error:database error");
                log.error(err.toString());
            }else{
                if(!user){
                return sendResult(res, "error", 6, "check token error");                    
                }else{
                    findOne(app_mem, {email:email, appDomain:appDomain, active:1, role:{$lt:3}}, function(err, mem){
                        if(err){
                            return sendResult(res, "error", 5, "system error:database error");
                            log.error(err.toString());                            
                        }else{
                            if(!mem){
                                return sendResult(res, "error", 7, "you don't have the app's permission");
                            }else{
                                return res.sendJson({status:"ok"});
                            }
                        }
                    })
                }
            }
        })
    }
 }
