var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var configInfo = JSON.parse(fs.readFileSync('./config.json').toString());


//exports.labs = configInfo.labs;
//是否debug模式
exports.switchs = configInfo.switchs;
exports.labs = configInfo.switchs.labs;
exports.daily = configInfo.switchs.daily;
var debug = exports.debug = exports.switchs.debug;

var root_dir = pathutil.dirname(pathutil.dirname(__dirname))
  , cnae_dir = pathutil.join(root_dir, 'cnode-app-engine');

// proxy config
exports.proxy_sock = pathutil.join(cnae_dir, 'run', 'proxy.sock');
exports.listen_sock_dir = pathutil.dirname(exports.proxy_sock);
exports.domain = configInfo.domain;

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
exports.regPass = /^(.){6,}$/;
exports.regName = /^([a-zA-Z0-9._\-]){1,20}$/;
exports.regMobile = /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5|8)\d{9}$/;
exports.regUrl = /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?$/;
exports.regGit = /^(git:\/\/github.com\/)[\w-.]+\/[\w-_.]+/;
exports.regNpm = /^[\w\d.-]+/;
//用户app使用数据库参数
exports.appDb = configInfo.appDb;
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
//inviteCode
//每个用户的邀请码数目
exports.maxCode = configInfo.maxInviteCode;
//邀请码注册链接
exports.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
if(!debug) {
    exports.port = 80;
    exports.inviteHref = "http://cnodejs.net/regist?code=";
}


exports.uploadDir = configInfo.uploadDir;
exports.tempDir = configInfo.tempDir;
exports.socketPort = configInfo.socketPort;
exports.monitor = configInfo.monitor;

if(exports.switchs.labs){
  if(exports.switchs.daily){
    exports.toplevelDomain = configInfo.toplevelDomainDaily;
  }else{
    exports.toplevelDomain = configInfo.toplevelDomainLabs;
  }
}else{
  exports.toplevelDomain = configInfo.toplevelDomainNAE;
}
exports.labsConf = configInfo.labsConf;
//管理员帐号表
exports.admins = configInfo.admins;

//github配置信息
exports.github = configInfo.github;