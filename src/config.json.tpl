{
  "dbInfo":{
  "host":"127.0.0.1",
  "port":"27017",
  "name":"$dbName$",
  "userName":"$dbUserName$",
  "password":"$dbPassword$",
  "collections":{
       "user":"$user$",
       "app_member":"$member$",
       "app_basic":"$basic$",
       "app_record":"$record"
     } 
  },
  "appDb":{
    "host":"127.0.0.1",
    "port":"20088"
  }, 
  "md5_secret":"$md5Secret$", 
  "session_secret":"$sessionSecret$",
  "timeOut":1296000000,
  "port":2012,
  "debug":true,
  "site_name":"Node App Engine",
  "domain":"cnodejs.net",
  "logPath":"../logs/system.log",
  
  "toplevelDomainNAE":".cnodejs.net",
  "toplevelDomainLabs":".nae.labs.toabao.com",
  "toplevelDomainDaily":".nae.labs.daily.taobao.net",

  "user":"$email$",
  "pass":"$emailPassword$", 
  "email":"$email$",
  "mailTitle":"Node App Engine协作邀请函",
  "mailContentPath":"./mailTemplate/coopInviteMail.html",
  "inviteMailTitle":"Node App Engine邀请码",
  "inviteMailContentPath":"./mailTemplate/inviteCodeMail.html",
  "retrieveMailTitle":"Node App Engine密码找回邮件",
  "retrieveMailContentPath":"./mailTemplate/retrieveMail.html",
  "retrieveLink":"http://cnodejs.net:2012/resetPassword",
  "applyMailTitle":"Node App Engine项目参与申请",
  "applyMailContentPath":"./mailTemplate/applyMail.html",
  "agreeMailTitle":"Node App Engine项目参与申请成功",
  "agreeMailContentPath":"./mailTemplate/agreeInviteMail.html",
  "refuseMailTitle":"Node App Engine项目参与申请被拒绝",
  "refuseMailContentPath":"./mailTemplate/refuseInviteMail.html",
  "admin":"$admin$",
  "smtp":{
    "host":"smtp.gmail.com",
    "port": 587,
    "ssl": false,
    "use_authentication": true,
    "user": "$email$",
    "pass": ""$emailPassword$""
  },
  "maxInviteCode":5,
  "uploadDir":"$uploadDir$",
  "tempDir":"$tempDir$",
  "socketPort":1128,
  "monitor":{
    "host":"127.0.0.1",
    "port":"1127"
  }, 
  "admins":["dead_horse@qq.com","fengmk2@gmail.com","kunfirst@gmail.com", "q3boy1@gmail.com"],
  "labs":false,
  "switchs":{
    "labs":false,
    "debug":true,
    "daily":true
  },
  "labsConf": {
	  "agentMaxSockets" : 256 ,
	  "checkUserOption" : {
	  "host":"dev.labs.daily.taobao.net",
	  "port":80,
	  "path":"/developers/checkUser.do"
	  },
	  "secret":"$tbSecret$" ,
	  "loginPath":"https://login.taobao.com/member/login.jhtml?from=labs-nae&redirect_url=http://nae.taobao.com:2012/checkLogin",
	  "loginPathDaily":"https://login.daily.taobao.net/member/login.jhtml?f=top&redirect_url=http://nae.labs.daily.taobao.net:2012/checkLogin"
  },
  "github":{
    "keyDir":"/home/heyiyu.pt/.ssh/nae/id_rsa_",
    "config":"/home/heyiyu.pt/.ssh/config",
    "genKey":"$HOME/cnae/git/cnae-web/src/shells/genKey.sh",
    "tplConfig":"#$email$\nHost $token$.github.com\n Hostname Github.com\n User git\n IdentityFile $file$\n"
  }
}
