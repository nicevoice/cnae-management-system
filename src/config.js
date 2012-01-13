var pathutil = require('path');
var mongo = require("mongoskin");
var fs = require('fs');
var log = require("./lib/log");

if(process.env.NODE_ENV === 'test'){
    var cI = JSON.parse(fs.readFileSync(__dirname+'/config.test.json').toString());  
  }else{
    var cI = JSON.parse(fs.readFileSync(__dirname+'/config.json').toString());  
}
var tempFile = pathutil.dirname(__dirname)+'/temp';
var config = {
  //nae-web db infos
  "dbInfo":cI.dbInfo||{
  "host":"127.0.0.1",
  "port":"20087",
  "name":"naeweb",
  "userName":"",
  "password":"",
  "collections":{
       "user":"user",
       "app_member":"member",
       "app_basic":"basic",
       "app_record":"record"
     } 
  },
  //nae-web redis passwor
  "redisPassword":cI.redisPassword||"",
  //nae apps db infos
  "appDb":cI.appDb||{
    "host":"127.0.0.1",
    "port":"20088"
  }, 
  "appDbAdmin":cI.appDbAdmin||{
    "userName" : "",
    "password" : ""
  },
  //password salt
  "md5_secret":cI.md5_secret||"",
  //session infos
  "session_secret":cI.session_secret||"secret",
  "timeOut":1296000000,
  "port":2012,
  "adminPort":2014,
  "site_name":"NAE: Node.Js应用托管引擎. power by: Cnode社区",
  "domain":cI.domain||"cnodejs.net",
  
  "toplevelDomainNAE":".cnodejs.net",
  "toplevelDomainLabs":".nae.labs.toabao.com",
  "toplevelDomainDaily":".nae.labs.daily.taobao.net",

  "mail":{
  "coopMailTitle":"Node App Engine协作邀请函",
  "coopMailContent":'<body><p>您好！</p><p>您的NAE社区项目参与申请已被创建者通过。'+
                    '请到<a href="http://cnodejs.net">cnodejs.net</a>查看。如果无法打开链接，请复制到浏览器打开。</p></body>',
  "inviteMailTitle":"Node App Engine邀请码",
  "inviteMailContent":'<p>您好！</p><p>您收到了cnode app engine社区的邀请码，请点击链接注册。'
                     +'如果无法打开链接，请复制到浏览器打开。</p>',
  "retrieveMailTitle":"Node App Engine密码找回邮件",
  "retrieveMailContent":'<body><p>您好，欢迎使用NAE密码找回功能。</p>'+
                        '<p>请在24小时内点击以下链接重置您的密码：(如果您没有申请找回密码，请忽略此邮件。)</p></body>',
  "applyMailTitle":"Node App Engine项目参与申请",
  "applyMailContent":'<p>您好！</p><p>您的NAE社区项目收到了社区成员的参与申请。请到'+
                     '<a href="http://cnodejs.net/application/manage/$domain$/coopmng">cnodejs.net/application/manage/$domain$/coopmng</a>'+
                     '对应应用的成员管理栏查看。如果无法打开链接，请复制到浏览器打开。</p>',
  "agreeMailTitle":"Node App Engine项目参与申请成功",
  "agreeMailContent":'<body><p>您好！</p><p>您的NAE社区项目参与申请已被创建者通过。'+
                     '请到<a href="http://cnodejs.net">cnodejs.net</a>查看。'+
                     '如果无法打开链接，请复制到浏览器打开。</p></body>',
  "refuseMailTitle":"Node App Engine项目参与申请被拒绝",
  "refuseMailContent":'<body><p>您好！</p><p>您的NAE社区项目参与申请被创建者拒绝。拒绝理由：</p></body>',
  "registMailTitle":"欢迎注册NAE",
  "registMailContent":'<body><p>您好！</p><p>您的NAE帐号已成功注册，'+
                      '请点击下列链接激活并登录您的帐号。如无法打开链接，请复制到浏览器打开。</p></body>',
  "admin":"heyiyu.deadhorse@gmail.com",
  "smtp":{
    "host":"smtp.gmail.com",
    "port": 587,
    "ssl": false,
    "use_authentication": true,
    "user": cI.mailUser||"",
    "pass": cI.mailPassword||""
  },
  "sender":"NAE <admin@cnodejs.com>"
  },
  "maxInviteCode":5,
  "logPath": pathutil.dirname(__dirname)+'/logs/',
  "uploadDir":cI.uploadDir||tempFile,
  "tempDir":cI.tempDir||tempFile,
  "socketPort":1128,
  "monitor":{
    "host":"127.0.0.1",
    "port":"1127"
  }, 
  "admins":cI.admins||["dead_horse@qq.com"],
  "switchs":cI.switchs||{
    "labs": false,
    "debug":true,
    "daily":false,
    "noGit":false
  },
  "labsConf": cI.labsConf||{},
  "github":{
    "keyDir":cI.githubKeyDir||tempFile,
    "config":cI.githubConfig||tempFile,
    "genKey":"$HOME/cnae/git/cnae-web/src/shells/genKey.sh",
    "tplConfig":"#$email$\nHost $token$.github.com\n Hostname Github.com\n User git\n IdentityFile $file$\n"
  },
  "dbError":"数据库错误，请稍后再试"
}

var root_dir = pathutil.dirname(pathutil.dirname(__dirname))
  , cnae_dir = pathutil.join(root_dir, 'cnode-app-engine');
  config.proxy_sock = pathutil.join(cnae_dir, 'run', 'proxy.sock');
  config.listen_sock_dir = pathutil.dirname(config.proxy_sock);

//log
if(process.env.NODE_ENV==='test'){
  config.logWithFile = log.create(log.INFO);
}else{
  var root = pathutil.dirname(__dirname);
  config.logWithFile = log.create(log.ERROR, {file:root+'/logs/system.log'});
  config.reqLogPath = root + '/logs/requests.log';
}

//组装dbUrl
var dbInfo = config.dbInfo;
config.db_url = dbInfo.userName+":"+dbInfo.password+"@"+dbInfo.host+"/"+dbInfo.name;


//邮件内链接（邀请、激活、申请）
config.inviteHref = "http://cnodejs.net:"+config.port+"/regist?code=";
config.retrieveLink = "http://" + config.domain + ':'+config.port + "/resetpassword";
config.registActivateLink = "http://cnodejs.net:"+config.port+"/regist/activate";
if(!config.switchs.debug) {
    config.port = 80;
    config.inviteHref = "http://cnodejs.net/regist?code=";
    config.retrieveLink = "http://" + config.domain + "/resetpassword";
    config.registActivateLink = "http://cnodejs.net/regist/activate";
}

//dberror display
//labs
config.labs= config.switchs.labs;
if(config.switchs.labs){
  if(config.switchs.daily){
    config.toplevelDomain = config.toplevelDomainDaily;
  }else{
    config.toplevelDomain = config.toplevelDomainLabs;
  }
}else{
  config.toplevelDomain = config.toplevelDomainNAE;
}

module.exports = config;

