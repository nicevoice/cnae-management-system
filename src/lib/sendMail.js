//email
var config = require("../config"),
    log = config.logWithFile,
    EventProxy = require('EventProxy.js').EventProxy;
var mailEvent = exports.mailEvent = new EventProxy();
var nodemailer = exports.nodemailer = require('nodemailer');
nodemailer.SMTP = config.mail.smtp;

var mails = exports.mails = [];
var timer;
mailEvent.on("getMail", function() {
    console.log(mails.length);
    if(mails.length === 0) {
        return;
    } else {
        //遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
        var failed = false;
        for(var i = 0, len = mails.length; i != len; ++i) {
            var message = mails[i];
            mails.splice(i, 1);
            i--;
            len--;
            var mail;
            try {
                mail = nodemailer.send_mail(message, function(error, success) {
                    if(error) {
                        log.error(error.toString());
                        mails.push(message);
                        failed = true;
                    }
                    if(success) {
                        return;
                    }
                });
            } catch(e) {
                log.error("发送失败。重新发送");
                mails.push(message);
                failed = true;
            }
            var oldemit = mail.emit;
            mail.emit = function() {
                oldemit.apply(mail, arguments);
            }
        }
        if(failed) {
            clearTimeout(timer);
		    timer = setTimeout(fire, 60000);
        }
    }
});


function fire(){
	mailEvent.fire("getMail");
}
