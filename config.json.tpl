{
	dbName:"nae_db",
	dbUserName:"deadhorse",
	dbPassword:"901022",
  collections:{
    user:"nae_user",
    app_member"nae_app_members",
    app_basic:"nae_app_basic_infos",
    app_record:"nae_app_manage_records",
    inviteCode:"nae_inviteCode",
    app_todo:"nae_app_todos"
  }
  
  session_secret:"change to your own secret key",
  timeOut:3600000*24*14,
  port:2012,
	debug:true,
  site_name:"Node App Engine",
  
  regEmail:/^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/,
  regPass:/^(\w){6,20}$/,
  regName:/^([a-zA-Z0-9._\-]){2,20}$/,
  
  logPath:"./logs/system.log",
  
  email:"heyiyu.deadhorse@gmail.com",
  mailTitle:"Node App Engine协作邀请函",
  mailContentPath:"./mailTemplate/coopInviteMail.html",
  inviteMailTitle:"Node App Engine邀请码",
  inviteMailContentPath:"./mailTemplate/inviteCodeMail.html",
  admin:"dead_horse@qq.com",
  smtp:{
    host: 'smtp.gmail.com',
    port: 587,
    ssl: false,
    use_authentication: true,
    user: "heyiyu.deadhorse@gmail.com",
    pass: "heyiyuaaqq12"
  }
  
  uploadDir:"node-app-engine/apps",
  tempDir:"./temp",
  socketPort:1128,
  
  admins:["dead_horse@qq.com","fengmk2@gmail.com","kunfirst@gmail.com", "q3boy1@gmail.com"],
 
  inviteHref:"http://cnodejs.net:2012"/regist?code=",
  debugInviteHref:"http://cnodejs.net/regist?code="
}