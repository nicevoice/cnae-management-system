var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var configInfo = JSON.parse(fs.readFileSync('./config.json').toString());


//exports.labs = configInfo.labs;
//是否debug模式
exports.switchs = configInfo.switchs;
exports.labs = configInfo.switchs.labs;
var debug = exports.debug = exports.switchs.debug;

var root_dir = pathutil.dirname(__dirname)
  , cnae_dir = pathutil.join(root_dir, 'cnode-app-engine');

// proxy config
exports.proxy_sock = pathutil.join(cnae_dir, 'run', 'proxy.sock');
exports.listen_sock_dir = pathutil.dirname(exports.proxy_sock);

exports.md5_secret = configInfo.md5_secret;
exports.session_secret = configInfo.session_secret;
var port = exports.port = configInfo.port;
exports.email = configInfo.email;
exports.site_name = configInfo.site_name;

var dbInfo = exports.dbInfo = configInfo.dbInfo;
exports.db_url = dbInfo.userName+":"+dbInfo.password+"@"+dbInfo.host+"/"+dbInfo.name;
/***
 * 用户信息：email,nickName,password,realName,telNumber,mainPage
 * */
//exports.db_user = configInfo.collections.user;
///***
// * 应用成员信息:appDomain, appName, email, role
// * 总共4种身份，从0～3：创建者，管理者，参与者，观察者
// */
//exports.db_app_mem = configInfo.collections.app_member;
///***
// * 应用基本信息：appDomain, appName（有冗余，可以减少多表查询）,appDescribe,appState,appCreateTime...//todo
// */
//exports.db_app_basic =configInfo.collections.app_basic;
//exports.db_app_records = configInfo.collections.app_record;
//exports.db_inviteCode = configInfo.collections.inviteCode;
//exports.db_app_todo = configInfo.collections.app_todo;
//session
exports.session_timeOut = configInfo.timeOut;
//正则
exports.regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
exports.regPass = /^[a-zA-Z0-9_\!\@\#\$\%\^\&\*\(\)]{6,20}$/;
exports.regName = /^([a-zA-Z0-9._\-]){2,20}$/;
exports.regMobile = /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5|8)\d{9}$/;
exports.regUrl = /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?$/;

//log
var log = require("./lib/log");
exports.logWithFile = log.create(log.INFO, configInfo.logPath);
//mail的配置
//协作邀请邮件的模板
exports.mailTitle =  configInfo.mailTitle;
exports.mailContent = fs.readFileSync(configInfo.mailContentPath, "utf-8");
//发送邀请函邮件的模板
exports.inviteMailTitle = configInfo.inviteMailTitle;
exports.inviteMailContent = fs.readFileSync(configInfo.inviteMailContentPath, "utf-8");
//找回密码邮件模板
exports.retrieveMailTitle = configInfo.retrieveMailTitle;
exports.retrieveMailContent = fs.readFileSync(configInfo.retrieveMailContentPath, "utf-8");
exports.retrieveLink = configInfo.retrieveLink;
//申请参与邮件模板
exports.applyMailTitle = configInfo.applyMailTitle;
exports.applyMailContent = fs.readFileSync(configInfo.applyMailContentPath, "utf-8");
//同意参与邮件模板
exports.agreeMailTitle = configInfo.agreeMailTitle;
exports.agreeMailContent = fs.readFileSync(configInfo.agreeMailContentPath, "utf-8");
//拒绝参与邮件模板
exports.refuseMailTitle = configInfo.refuseMailTitle;
exports.refuseMailContent = fs.readFileSync(configInfo.refuseMailContentPath, "utf-8");
exports.admin = configInfo.admin;
exports.smtp = {
    host: configInfo.smtp.host,
    port: configInfo.smtp.port,
    ssl: configInfo.smtp.ssl,
    use_authentication: configInfo.smtp.use_authentication,
    user: configInfo.user,
    pass: configInfo.pass
};
//邀请码注册链接
exports.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
if(!debug) {
    exports.port = 80;
    exports.inviteHref = "http://cnodejs.net/regist?code=";
}


exports.uploadDir = configInfo.uploadDir;
exports.tempDir = configInfo.tempDir;
exports.socketPort = configInfo.socketPort;

exports.toplevelDomain = configInfo.toplevelDomain;
exports.labsConf = configInfo.labsConf;
//管理员帐号表
exports.admins = configInfo.admins;
//格式化Date
/**
* 时间对象的格式化;
*/
Date.prototype.format = function(format){
 /*
  * eg:format="YYYY-MM-dd hh:mm:ss";
  */
 var o = {
  "M+" :  this.getMonth()+1,  //month
  "d+" :  this.getDate(),     //day
  "h+" :  this.getHours(),    //hour
      "m+" :  this.getMinutes(),  //minute
      "s+" :  this.getSeconds(), //second
      "q+" :  Math.floor((this.getMonth()+3)/3),  //quarter
      "S"  :  this.getMilliseconds() //millisecond
   }
  
   if(/((|Y|)+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
   }
 
   for(var k in o) {
    if(new RegExp("("+ k +")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    }
   }
 return format;
}

String.prototype.trim = function() {
return this.replace(/^\s+|\s+$/g, "");
}

//格式化Date
/**
* 时间对象的格式化;
*/
Date.prototype.format = function(format){
 /*
  * eg:format="YYYY-MM-dd hh:mm:ss";
  */
 var o = {
  "M+" :  this.getMonth()+1,  //month
  "d+" :  this.getDate(),     //day
  "h+" :  this.getHours(),    //hour
      "m+" :  this.getMinutes(),  //minute
      "s+" :  this.getSeconds(), //second
      "q+" :  Math.floor((this.getMonth()+3)/3),  //quarter
      "S"  :  this.getMilliseconds() //millisecond
   }
  
   if(/((|Y|)+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
   }
 
   for(var k in o) {
    if(new RegExp("("+ k +")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    }
   }
 return format;
}

String.prototype.trim = function() {
return this.replace(/^\s+|\s+$/g, "");
}

require('http').ServerResponse.prototype.sendJson = function(data){
  body = new Buffer(JSON.stringify(data));
	this.writeHead(200, {"Content/type":"text/json", "Content/length":body.length});
	this.end(body);
}