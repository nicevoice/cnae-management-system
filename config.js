var mongo = require("mongoskin");
var fs = require('fs');
//exports.session_secret = 'tsoedsosisession_secretonsheecfrxedta';
exports.session_secret = "keyboard cat";
var port = exports.port = 2012;
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
exports.logWithFile = log.create(log.INFO, './my.log');
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

exports. uploadDir = "/home/admin/cnae/git/cnode-app-engine/apps";
//发送json格式
exports.resAjax = function(res, data){
		body = new Buffer(JSON.stringify(data));
		res.writeHead(200, {"Content/type":"text/json",
		"Content/length":body.length});
		res.end(body);
}

exports.socketPort = 1128;

//管理员帐号表
exports.admins = ["dead_horse@qq.com","fengmk2@gmail.com",
				  "kunfirst@gmail.com", "q3boy1@gmail.com"];

//邀请码注册链接
exports.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
//操作应用上下线的请求参数 todo
exports.options = {
host: '127.0.0.1',
port: 1127,
method: 'post'
};	
