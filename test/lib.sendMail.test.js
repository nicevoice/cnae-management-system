  var sendMail = require('../src/lib/sendMail')
  , fs = require('fs')
  , path = require('path')
  , mails = sendMail.mails
  , mailEvent =sendMail.mailEvent
  , mail = JSON.parse(fs.readFileSync(path.dirname(__dirname)+'/src/config.json').toString()).mail;

  var email = "dead_horse@qq.com";
  var nick = email.split('@')[0];

var contents = [
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.coopMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.inviteMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.retrieveMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.applyMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.agreeMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.refuseMailContentPath, 'utf8'),
  fs.readFileSync(path.dirname(__dirname)+'/src/'+mail.registMailContentPath, 'utf8')
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