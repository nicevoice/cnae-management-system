//email
var config = require("../config"),
    log = config.logWithFile,
    EventProxy = require('EventProxy.js').EventProxy;
var mailEvent = exports.mailEvent = new EventProxy();
var nodemailer = exports.nodemailer = require('nodemailer');
nodemailer.SMTP = config.smtp;

var mails = exports.mails = [];
var timer;
mailEvent.on("getMail", function(){
	if(mails.length===0){
		return;
	}else{
		//遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
	for(var i=0, len=mails.length; i!=len; ++i){
		var message = mails[i];	
		mails.splice(i, 1); i--; len--;
		var mail;
		try{
			console.log(message);
			mail = nodemailer.send_mail(message, function(error, success){
		    if(error){
		    	log.error(error.toString());
		    	mails.push(message);
		    	timer = setTimeout(fire, 60000);
		    }
		    if(success){
		    	return ;
		    }
		    });
		    }catch(e){
		    console.log("发送失败。重新发送");
		    mails.push(message);
		    timer = setTimeout(fire, 600000);
			}
		var oldemit = mail.emit;
		mail.emit = function(){
    	oldemit.apply(mail, arguments);
		}			
	}
	}
});

function fire(){
	mailEvent.fire("getMail");
}