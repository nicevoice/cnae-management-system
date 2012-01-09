{
  "dbInfo":{
  "host":"127.0.0.1",
  "port":"27017",
  "name":"$$dbName$$",
  "userName":"$$dbUserName$$",
  "password":"$$dbPassword$$",
  "collections":{
       "user":"$$user$$",
       "app_member":"$$app_member$$",
       "app_basic":"$$app_basic$$",
       "app_record":"$$app_record$$"
     } 
  },
  "redisPassword":"$$redisPassword$$",
  "appDb":{
    "host":"127.0.0.1",
    "port":"$$appDbPort$$"
  }, 
  "appDbAdmin":{
    "userName":"$$appDbUserName$$",
    "password":"$$appDbPassword$$"
  },
  "md5_secret":"$$md5Secret$$",     ##md5 secret for login
  "session_secret":"$$sessionSecret$$", ##secret for session
  "timeOut":1296000000,
  "port":2012,
  "adminPort":2014,
  "site_name":"NAE: Node.Js应用托管引擎. power by: Cnode社区",
  "domain":"$$domain$$",
  "logPath":"$$__dir$$/logs/system.log",
  
  "toplevelDomainNAE":".cnodejs.net",
  "toplevelDomainLabs":".nae.labs.toabao.com",
  "toplevelDomainDaily":".nae.labs.daily.taobao.net",

  "mail":{
  "coopMailTitle":"Node App Engine协作邀请函",
  "coopMailContentPath":"/mailTemplate/coopInviteMail.html",
  "inviteMailTitle":"Node App Engine邀请码",
  "inviteMailContentPath":"/mailTemplate/inviteCodeMail.html",
  "retrieveMailTitle":"Node App Engine密码找回邮件",
  "retrieveMailContentPath":"/mailTemplate/retrieveMail.html",
  "retrieveLink":"http://cnodejs.net/resetPassword",
  "applyMailTitle":"Node App Engine项目参与申请",
  "applyMailContentPath":"/mailTemplate/applyMail.html",
  "agreeMailTitle":"Node App Engine项目参与申请成功",
  "agreeMailContentPath":"/mailTemplate/agreeInviteMail.html",
  "refuseMailTitle":"Node App Engine项目参与申请被拒绝",
  "refuseMailContentPath":"/mailTemplate/refuseInviteMail.html",
  "registMailTitle":"欢迎注册NAE",
  "registMailContentPath":"/mailTemplate/registMail.html",
  "admin":"heyiyu.deadhorse@gmail.com",
  "smtp":{
    "host":"smtp.gmail.com",
    "port": 587,
    "ssl": false,
    "use_authentication": true,
    "user": "$$smtpuser$$",
    "pass": "$$smtppass$$"
  },
  "sender":"NAE <admin@cnodejs.com>"
  },
  "maxInviteCode":5,
  "uploadDir":"$$uploadDir$$",
  "tempDir":"$$__dir$$/temp",
  "socketPort":1128,
  "monitor":{
    "host":"127.0.0.1",
    "port":"1127"
  }, 
  "admins":["dead_horse@qq.com"],
  "switchs":{
    "labs": $$slabs$$,
    "debug":$$sdebug$$,
    "daily":$$sdaily$$,
    "noGit":$$snoGit$$
  },
  "labsConf": { ##labs的参数
	  "agentMaxSockets" : 256 ,
	  "checkUserOption" : {
	  "host":"$$labsHost$$",
	  "port":$$labsPort$$,
	  "path":"/developers/checkUser.do"
	  },
	  "secret":"$$tbSecret$$" ,
	  "loginPath":"https://login.taobao.com/member/login.jhtml?from=labs-nae&redirect_url=http://nae.taobao.com:2012/checkLogin",
	  "loginPathDaily":"https://login.daily.taobao.net/member/login.jhtml?f=top&redirect_url=http://nae.labs.daily.taobao.net:2012/checkLogin"
  },
  "github":{    ##设置个人github私钥的参数
    "keyDir":"$$gitKey$$",
    "config":"$$gitConfig$$",
    "genKey":"$$shells$$/genKey.sh",
    "tplConfig":"#$email$\nHost $token$.github.com\n Hostname Github.com\n User git\n IdentityFile $file$\n"
  }
}
