var model = require('../models/index'),
    findOne = model.findOne,
    update = model.update,
    config = require('../config'),
    log = config.logWithFile,
    user = config.dbInfo.collections.user,
    md5 = require('../lib/md5').hex_md5,
    getRandomString = require('../lib/randomString').getRandomString,
    urlMoudle = require('url');

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
    if(!email.match(config.regEmail)){
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
