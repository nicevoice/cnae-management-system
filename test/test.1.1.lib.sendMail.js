  var sendMail = require('../src/lib/sendMail')
  , fs = require('fs')
  , path = require('path')
  , mails = sendMail.mails
  , mailEvent =sendMail.mailEvent
  , mail = require('../src/config').mail;

  var email = "dead_horse@qq.com";
  var nick = email.split('@')[0];

var contents = [
  mail.coopMailContent,
  mail.inviteMailContent,
  mail.retrieveMailContent,
  mail.applyMailContent,
  mail.agreeMailContent,
  mail.refuseMailContent,
  mail.registMailContent,
];
var titles = [
  mail.coopMailTitle,
  mail.inviteMailTitle,
  mail.retrieveMailTitle,
  mail.applyMailTitle,
  mail.agreeMailTitle,
  mail.refuseMailTitle,
  mail.registMailTitle
];
describe('send mail', function(){
  it('#sendMail()', function(done){
    for(var i=0, len=titles.length; i!=len; ++i){
      mails.push({
          sender: mail.sender,
          to : nick + " <"+email + ">",
          subject: titles[i],
          html: contents[i].toString(),
          debug: true
      });
      mailEvent.fire('getMail');
    }
    setTimeout(function(){
        mails.should.have.length(0);
        done();
    }, 20);
  })
})