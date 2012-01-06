var utils = require('../src/lib/utils');
var net = require('net');
var command_line = require('./helper/command_line');
var http = require('./helper/tb_session_proxy');
var cp = require('child_process');
var fs = require('fs');
var config = require('./config.test');
var createDone = function(times, done){
  return function(){
    if(--times===0){
      done();
    }
  }
}

describe('utils', function(){
  before(function(){
    cp.exec('cp -rf '+__dirname+'/temp/uploadFile.back.tar.gz ' + __dirname+'/temp/uploadFile.tar.gz', function(){});
    command_line.listen(config.cmdPort);
  })
  describe('#verify()', function(){
    var regRight = {
      email: 'az_-+.AZ19@alibaba-inc.com.cn',
      domain:'azx09_',
      password:'zxv1203[#@*($#,/xcv',
      name:'zks_123.-',
      mobile:'13813259998',
      url:'https://github.com/andris9/Nodemailer?query=s&sd=4324#top',
      githubCode : 'git://github.com/chriso/node-validator.git',
      npm : 'test-npm.js',
      githubPage : 'https://github.com/andris9/Nodemailer/tree/master/lib/engines',
      imgSource : 'http://ww2.sinaimg.cn/large/6dc6b05dgw1dolk4bws6lj.jpg',
      files : '-+tes中文测试t_files.^%',
      gitAction : 'git pull origin master',
      gitClone : 'git    clone https://github.com/andris9/Nodemailer.git'
    }

    var regWrong = {
      email : 'wrong!email.@alibaba-inc.com.cn',
      domain : '1adm',
      password: '12345',
      name : 'a_1.!',
      mobile : '135801955431',
      url : 'http1s://trello.com/',
      githubCode : 'https://github.com/dead-horse/cnae-management-system',
      npm : '!test_!~a',
      githubPage : 'https://gitub.com/dead-horse/cnae-management-system/git/test',
      imgSource : 'https://github.com/dead-horse/cnae-management-system',
      files : 'szkl&',
      gitAction : 'git pull && cd ..',
      gitClone : 'git cllone'
    }
    it('should return true', function(){
      for(var key in regRight){
        utils.verify(key, regRight[key]).should.be.true;
      }     
    });
    it('should return false', function(){
      for(var key in regRight){
        utils.verify(key, regWrong[key]).should.be.false;
      }           
    })
  });

  describe('#hex_md5()', function(){
    it('should return md5 value of chinese', function(){
      utils.hex_md5('中文 英文').should.equal('3d4aac619bc3d36f72dc2950e4fce4eb');
    });
    it('shoud return md5 value of number and letter', function(){
      utils.hex_md5('chinese english').should.equal('6380f957c41803c7d69bc1a211bc9f3b');      
    })
  });

  describe('#getRandomString()', function(){
    it('should return random string letters with the length', function(){
      /^[a-zA-Z]{20}$/.test(utils.getRandomString(20)).should.be.true;
    });
  });

  describe('#getRandomStringNum()', function(){
    it('should return random string letters and numbers with the length', function(){
      /^[a-zA-Z0-9]{20}$/.test(utils.getRandomStringNum(20)).should.be.true;
    });
  });
/*
  describe('#getFromeCookie()', function(){
    it('should get cookie_value by cookie_name', function(){
      var cookies = "cookie1:it_is_cookie_one;cookie2:it_is_cookie_two";
      utils.getFromCookie(cookies, 'cookie1').should.equal('it_is_cookie_one');
    })
  })*/

  describe('#checkTBSession()', function(){
    var req = {
      headers:{
        cookie:"cookie2=it_is_cookie_one;cookie1=it_is_cookie_two"
      }
    }   
    it('should return wrong', function(done){
      utils.checkTBSession(req, function(res){
        res.status.should.equal('false');
        res.code.should.equal('1');
        done();
      });
    })
    it('should return ok', function(done){
      req.headers.cookie = 'cookie2=id001;cookie1=sdfak';
      utils.checkTBSession(req, function(res){
        res.code.should.equal('0');
        done(); 
      })      
    })
  });

  describe('#onOff()', function(){
    it('should work ok', function(done){
      utils.onOff('start', 'app1', function(res){
        res.status.should.equal('ok');
        done();
      })
    });
    it('should wrong head', function(done){
      utils.onOff('start_test', 'app1', function(res){
        res.msg.should.match(/Cmd not found/);
        done();
      })
    })
    it('should not receive a json', function(done){
      utils.onOff('start', 'app3', function(res){
        res.msg.should.match(/not json/);
        done();
      })
    })
  })

  describe('#getLog()', function(){
    it('should get log ok', function(done){
      utils.getLog('stdout', 'app1', 1000, function(buf){
        buf.length.should.not.below(100);
        done();
      })
    })
  })

  describe('#httpReq()', function(){
    var options = {
      host:'localhost',
      port:'1129',
      method:'get'
    }
    it('should get json ok', function(done){
      options.path = '/json';
      utils.httpReq(options, function(data){
        data.should.be.json;
        done();
      })  
    });
    it('should get string ok', function(done){
      options.path = '/string';
      utils.httpReq(options, function(data){
        data.should.be.a('string');
        done();
      }, 'string')  
    })
    it('shoud get json wrong', function(done){
      options.path = '/wrongjson';
      utils.httpReq(options, function(data){
        data.status.should.equal('error');
        data.msg.should.match(/not json/);
        done();
      }, 'json')
    })
  })

  describe('#addGithub()', function(){
    it('should add github work fine', function(done){
      var DONE = createDone(2, done);
      utils.addGithub('dead_horse@qq.com', '281102972@qq.com', function(err, data){
        data.status.should.equal('ok');
        DONE();
      })
      setTimeout(function(){
        fs.readdirSync(config.github.keyDir).should.have.length(3);
        fs.readFileSync(config.github.keyDir+'/config').should.match(/dead_horse@qq.com/);   
        DONE();
      }, 2000);
    })
  }),

  describe('#upload', function(){
    var files = {upload:{filename:'uploadFile.tar.gz', path:__dirname+'/temp/uploadFile.tar.gz'}};
    it('should upload fine', function(done){
      utils.upload(files, __dirname+'/temp/temp/uploadFile.tar.gz', function(data){
        data.msg.should.equal('succeed');
        done();
      })
    })
  })

  after(function(){
    command_line.close();
    http.close();
    cp.exec('rm -rf ' + config.github.keyDir+'/* ' + __dirname+'/temp/temp/*', function(){})
  })
})