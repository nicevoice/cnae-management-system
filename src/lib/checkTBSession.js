var labsConf = require('../config').labsConf,
	md5 = require('./md5').hex_md5,
	httpReq = require('./httpReq').httpReq;
var getFromCookie = function(str, name, sign) {
    if(!str) {
        return null;
    }
    if(!sign){
        sign = ';';
    }
    var paramIndex = str.indexOf(name + '=');
    if(paramIndex == -1){
        return null;
    }
    var value;
    var beginIndex = paramIndex + name.length + 1;
    var endIndex = str.indexOf(sign, beginIndex);
    if(endIndex == -1){
        value = str.substring(beginIndex);
    }else{
        value = str.substring(beginIndex, endIndex);
    }
    return value;
};

module.exports = function(req, cb){
	 var sessionId = getFromCookie(req.headers.cookie, "cookie2") || '';
	 console.log(sessionId);
    //检查用户是否是开发者
    var secret = unescape(labsConf.secret);
    var checkUserOption = {};
    checkUserOption.host = labsConf.checkUserOption.host;
    checkUserOption.port = labsConf.checkUserOption.port;
    checkUserOption.path = labsConf.checkUserOption.path;
    checkUserOption.path += "?sessionId="+encodeURIComponent(sessionId)+"&sign="+md5(secret + sessionId + secret).toUpperCase();
	httpReq(checkUserOption, function(checkRes){
		  console.log(checkRes);
		  cb(checkRes);
    });
}
