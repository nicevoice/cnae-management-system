var mongo = require("mongoskin");
var fs = require('fs');
//exports.session_secret = 'tsoedsosisession_secretonsheecfrxedta';
exports.session_secret = "keyboard cat";
exports.port = 8080;
exports.email = "heyiyu.deadhore@gmail.com";
exports.site_name = "Node App Engine";
exports.site_desc = '';

exports.db_url = "localhost:27017/nae_db";
exports.db = mongo.db(this.db_url);
/***
 * 用户信息：email,nickName,password,realName,telNumber,mainPage
 * */
exports.db_user = "nae_user";
/***
 * 应用成员信息:appDomain, appName, email, role
 * 总共4种身份，从0～3：创建者，管理者，参与者，观察者
 */
exports.db_app_mem = "nae_app_members";
/***
 * 应用基本信息：appDomain, appName（有冗余，可以减少多表查询）,appDescribe,appState,appCreateTime...//todo
 */
exports.db_app_basic ="nae_app_basic_infos";
exports.db_app_records = "nae_app_manage_records";
exports.db_inviteCode = "nae_inviteCode";
//cookie
exports.cookies_timeOut = 3600000*24*14;
exports.cookies_skey = "s3s3f3s1diz08fn3"
//log
var log = require("./lib/log");
exports.logWithFile = log.create(log.ERROR, './my.log');
//mail的配置
//协作邀请邮件的模板
exports.mailTitle =  'CNode App Engine协作邀请函';
exports.mailContent = fs.readFileSync("./mailTemplate/coopInviteMail.html", "utf-8");
//发送邀请函邮件的模板
exports.inviteMailTitle = "CNode App Engine邀请码";
exports.inviteMailContent = fs.readFileSync("./mailTemplate/inviteCodeMail.html", "utf-8");
exports.admin = "dead_horse@qq.com";
exports.smtp = {
    host: 'smtp.gmail.com',
    port: 465,
    use_authentication: true,
    ssl: true,
    user: "heyiyu.deadhorse@gmail.com",
    pass: "heyiyuaaqq12",
    debug: true
};

exports. uploadDir = "/home/deadhorse/code/nae/apps";
//发送json格式
exports.resAjax = function(res, data){
		body = new Buffer(JSON.stringify(data));
		res.writeHead(200, {"Content/type":"text/json",
		"Content/length":body.length});
		res.end(body);
}

//管理员帐号表
exports.admins = ["cnaeAdmin@gmail.com",
				  "user01@gmail.com"];

//操作应用上下线的请求参数 todo
exports.options = {
host: '127.0.0.1',
port: 1127,
method: 'post'
};	
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