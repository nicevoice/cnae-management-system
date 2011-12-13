var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var configInfo = JSON.parse(fs.readFileSync(__dirname+'/config.json').toString());
var log = require("./lib/log");
var workerNum = require('./server').workerNum;
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
var numPath = pathutil.dirname(configInfo.logPath)+'/worker.num';
var token = fs.readFileSync(numPath, 'utf8');
configInfo.logWithFile = log.create(log.ERROR, {file:configInfo.logPath+'.worker'+token});
fs.writeFileSync(numPath, parseInt(token)+1);
//读取mail正文
var mail = configInfo.mail;
mail.coopMailContent = fs.readFileSync(__dirname+mail.coopMailContentPath, "utf-8");//合作邀请
mail.inviteMailContent = fs.readFileSync(__dirname+mail.inviteMailContentPath, "utf-8");//邀请码
mail.retrieveMailContent = fs.readFileSync(__dirname+mail.retrieveMailContentPath, "utf-8");//找回密码
mail.applyMailContent = fs.readFileSync(__dirname+mail.applyMailContentPath, "utf-8");//申请项目
mail.agreeMailContent = fs.readFileSync(__dirname+mail.agreeMailContentPath, "utf-8");//同意
mail.refuseMailContent = fs.readFileSync(__dirname+mail.refuseMailContentPath, "utf-8");//拒绝

configInfo.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
configInfo.retrieveLink = "http://" + configInfo.domain + ':'+port + "/resetpassword";
if(!debug) {
    configInfo.port = 8080;
    configInfo.inviteHref = "http://cnodejs.net/regist?code=";
    configInfo.retrieveLink = "http://" + configInfo.domain + "/resetpassword";
}

//labs
configInfo.labs= configInfo.switchs.labs;
if(configInfo.switchs.labs){
  if(configInfo.switchs.daily){
    configInfo.toplevelDomain = configInfo.toplevelDomainDaily;
  }else{
    configInfo.toplevelDomain = configInfo.toplevelDomainLabs;
  }
}else{
  configInfo.toplevelDomain = configInfo.toplevelDomainNAE;
}
module.exports = configInfo;
