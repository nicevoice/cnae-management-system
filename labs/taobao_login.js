var http = require('http'),
	events = require("events"),
	util = require("util"),
	conf = require('./config.json'),
	tsess = require('taobao_session');


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

var TaobaoLogin = function() {
	this.agent = new http.Agent({
		maxSockets : conf.agentMaxSockets
	});
};



TaobaoLogin.prototype.getNick = function(cookie, cb) {
	var self = this;
	var input = getFromCookie(cookie, 'cookie2');
	var options = {
		host: 'sessionproxy.taobao.com',
		port: 80,
		path: '/sessionproxy/getSession?sessionid=' + input,
		agent : this.agent
	};
	http.get(options, function(res){
		var output = '';
		res.on('data', function (chunk) {
			output += chunk;
		});
		res.on('end', function(){
			if(output === 'userid=1'){
				cb(new Error('Not login'));
			} else {
				try {
					var data = tsess.decrypt(output);
					cb(null, data.nick);
				} catch(e) {
					cb(new Error("Session Decrypt Fail"));
				}
			}
		});
	}).on('error', function(err){
		cb(err);
	});
};

var login = new TaobaoLogin();

exports.login = login;
