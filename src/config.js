var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var configInfo = JSON.parse(fs.readFileSync('./config.json').toString());
var log = require("./lib/log");
//是否debug模式
var debug = configInfo.switchs.debug;

var root_dir = pathutil.dirname(pathutil.dirname(__dirname))
  , cnae_dir = pathutil.join(root_dir, 'cnode-app-engine');
  
// proxy config
configInfo.proxy_sock = pathutil.join(cnae_dir, 'run', 'proxy.sock');
configInfo.listen_sock_dir = pathutil.dirname(configInfo.proxy_sock);

var port = configInfo.port;

//组装dbUrl
var dbInfo = configInfo.dbInfo;
configInfo.db_url = dbInfo.userName+":"+dbInfo.password+"@"+dbInfo.host+"/"+dbInfo.name;

//log
configInfo.logWithFile = log.create(log.INFO, configInfo.logPath);

//读取mail正文
var mail = configInfo.mail;
mail.coopMailContent = fs.readFileSync(mail.coopMailContentPath, "utf-8");//合作邀请
mail.inviteMailContent = fs.readFileSync(mail.inviteMailContentPath, "utf-8");//邀请码
mail.retrieveMailContent = fs.readFileSync(mail.retrieveMailContentPath, "utf-8");//找回密码
mail.applyMailContent = fs.readFileSync(mail.applyMailContentPath, "utf-8");//申请项目
mail.agreeMailContent = fs.readFileSync(mail.agreeMailContentPath, "utf-8");//同意
mail.refuseMailContent = fs.readFileSync(mail.refuseMailContentPath, "utf-8");//拒绝

configInfo.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
if(!debug) {
    configInfo.port = 80;
    configInfo.inviteHref = "http://cnodejs.net/regist?code=";
}

if(configInfo.switchs.labs){
  if(configInfo.switchs.daily){
    configInfo.toplevelDomain = configInfo.toplevelDomainDaily;
  }else{
    configInfo.toplevelDomain = configInfo.toplevelDomainLabs;
  }
}else{
  configInfo.toplevelDomain = configInfo.toplevelDomainNAE;
}
configInfo.labsConf = configInfo.labsConf;
//管理员帐号表
configInfo.admins = configInfo.admins;

//github配置信息
configInfo.github = configInfo.github;

module.exports = configInfo;