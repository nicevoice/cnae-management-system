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

  "domain":"$$domain$$",

  "mailUser":"$$mailUser$$",
  "mailPassword":"$$mailPasswrod$$",

  "uploadDir":"$$uploadDir$$",
  "onlineDir":"$$onlineDir$$",
  "tempDir" : "$$tempDir$$",

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
  "githubKeyDir":"$$githubKeyDir$$",
  "githubConfig":"$$githubConfig$$",

  "commandLine":{ ##命令行参数
    "warnPsw" : "$$warnPsw$$" ##warn email psw
  }
}
