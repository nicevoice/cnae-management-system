var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var log = require("./lib/log");
var loadConf = function(){
  if(process.env.NODE_ENV === 'test'){
    var configInfo = JSON.parse(fs.readFileSync(__dirname+'/config.test.json').toString());  
  }else{
    var configInfo = JSON.parse(fs.readFileSync(__dirname+'/config.json').toString());  
  }
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
  if(process.env.NODE_ENV==='test'){
    configInfo.logWithFile = log.create(log.INFO);
  }else{
    var numPath = pathutil.dirname(configInfo.logPath)+'/worker.num';
    var token = configInfo.token = fs.readFileSync(numPath, 'utf8');
    configInfo.logWithFile = log.create(log.ERROR, {file:configInfo.logPath+'.worker'+token});
    fs.writeFileSync(numPath, parseInt(token)+1);
    configInfo.reqLogPath = pathutil.dirname(__dirname) + '/logs/requests.log';
  }
  //读取mail正文
  var mail = configInfo.mail;
  mail.coopMailContent = fs.readFileSync(__dirname+mail.coopMailContentPath, "utf8");//合作邀请
  mail.inviteMailContent = fs.readFileSync(__dirname+mail.inviteMailContentPath, "utf8");//邀请码
  mail.retrieveMailContent = fs.readFileSync(__dirname+mail.retrieveMailContentPath, "utf8");//找回密码
  mail.applyMailContent = fs.readFileSync(__dirname+mail.applyMailContentPath, "utf8");//申请项目
  mail.agreeMailContent = fs.readFileSync(__dirname+mail.agreeMailContentPath, "utf8");//同意
  mail.refuseMailContent = fs.readFileSync(__dirname+mail.refuseMailContentPath, "utf8");//拒绝
  mail.registMailContent = fs.readFileSync(__dirname+mail.registMailContentPath, "utf8");//注册激活
  //邮件内链接（邀请、激活、申请）
  configInfo.inviteHref = "http://cnodejs.net:"+port+"/regist?code=";
  configInfo.retrieveLink = "http://" + configInfo.domain + ':'+port + "/resetpassword";
        configInfo.registActivateLink = "http://cnodejs.net:"+port+"/regist/activate";
  if(!debug) {
      configInfo.port = 80;
      configInfo.inviteHref = "http://cnodejs.net/regist?code=";
      configInfo.retrieveLink = "http://" + configInfo.domain + "/resetpassword";
      configInfo.registActivateLink = "http://cnodejs.net/regist/activate";
  }

  //dberror display
  configInfo.dbError = '数据库错误，请稍后再尝试。';
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

}
loadConf();