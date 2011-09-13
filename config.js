var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var configInfo = JSON.parse(fs.readFileSync('./config.json').toString());

//是否debug模式
var debug = exports.debug = configInfo.debug;

var root_dir = pathutil.dirname(__dirname)
  , cnae_dir = pathutil.join(root_dir, 'cnode-app-engine');

// proxy config
exports.proxy_sock = pathutil.join(cnae_dir, 'run', 'proxy.sock');
exports.listen_sock_dir = pathutil.dirname(exports.proxy_sock);

exports.session_secret = configInfo.session_secret;
var port = exports.port = configInfo.port;
exports.email = configInfo.email;
exports.site_name = configInfo.site_name;

exports.db_url = configInfo.dbUserName+":"+configInfo.dbPassword+"@127.0.0.1:27017/"+configInfo.dbName;
exports.db = mongo.db(this.db_url);
/***
 * 用户信息：email,nickName,password,realName,telNumber,mainPage
 * */
exports.db_user = configInfo.collections.user;
/***
 * 应用成员信息:appDomain, appName, email, role
 * 总共4种身份，从0～3：创建者，管理者，参与者，观察者
 */
exports.db_app_mem = configInfo.collections.app_member;
/***
 * 应用基本信息：appDomain, appName（有冗余，可以减少多表查询）,appDescribe,appState,appCreateTime...//todo
 */
exports.db_app_basic =configInfo.collections.app_basic;
exports.db_app_records = configInfo.collections.app_record;
exports.db_inviteCode = configInfo.collections.inviteCode;
exports.db_app_todo = configInfo.collections.app_todo;
//session
exports.session_timeOut = configInfo.timeOut;
//正则
exports.regEmail = configInfo.regEmail;
exports.regPass = configInfo.regPass;
exports.regName = configInfo.regName;
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
exports.admin = configInfo.admin;
exports.smtp = {
    host: configInfo.smtp.host,
    port: configInfo.smtp.port,
    ssl: configInfo.smtp.ssl,
    use_authentication: configInfo.smtp.use_authentication,
    user: configInfo.users,
    pass: configInfo.pass
};

exports.uploadDir = configInfo.uploadDir;
exports.tempDir = configInfo.tempDir;
exports.socketPort = configInfo.socketPort;

//管理员帐号表
exports.admins = configInfo.admins;

//邀请码注册链接
exports.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
if(!debug) {
    exports.port = 80;
    exports.inviteHref = "http://cnodejs.net/regist?code=";
}