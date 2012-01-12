var app = require('../src/app');
var config = require('../src/config');
var testConf = require('./config.test');
var db = require('../src/models/index');
var utils = require('./helper/testUtils');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var clone = utils.clone,
    Request = utils.Request,
    Get = utils.Get,
    Post = utils.Post,
    cookie = utils.cookie,
    createDone = utils.createDone;
    tpl = utils.tpl;

var COOKIE_1='';
var CSRF_1='';
var COOKIE_2 = '';
var CSRF_2 = '';
var code = '';//store inviteCode
describe('userCenter test', function(){
  before(function(done){
    app.listen(1130);
    var DONE = createDone(2, done);
    var opt = clone(tpl);
    opt.path = '/login';
    Get(opt, function(res){
      CSRF_1 = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/.exec(res.body)[1];
      opt.headers.cookie = COOKIE_1 = cookie(res.headers['set-cookie']);
      opt.path = '/checkLogin';
      opt.data = {
      email : 'dead_horse@qq.com',
      pwd : 'test12',
      remeber_me : true,
      _csrf : CSRF_1
      }
      Post(opt, function(res){  //login use http.request
        DONE();
      });
    })
    var opt2 = clone(tpl);
    opt2.path = '/login';
    opt2.headers['user-agent'] = '1';
    Get(opt2, function(res){
      CSRF_2 = /<input type="hidden" name="_csrf" id="_csrf" value="(\w+)">/.exec(res.body)[1];
      opt2.headers.cookie = COOKIE_2 = cookie(res.headers['set-cookie']);
      opt2.path = '/checkLogin';
      opt2.data = {
      email : 'user1@qq.com',
      pwd : 'test12',
      remeber_me : true,
      _csrf : CSRF_2
      }
      Post(opt2, function(res){  //login use http.request
        DONE();
      });
    })
  })
    
    describe('#apply()', function(){
      var opt = clone(tpl);
      opt.path = '/appSquare/apply';
      it('should apply fine', function(done){
        opt.headers.cookie = COOKIE_2;
        opt.headers['user-agent']='1';
        opt.data = {
          _csrf : CSRF_2,
          domain : 'test5',
          name : 'test5',
          nickName : 'dead_horse',
          email : 'dead_horse@qq.com'
        }
        Post(opt, function(res){
          res.body.should.equal('{"status":"ok"}');
          opt.data.domain = 'test6';
          opt.data.name = 'test6';
          Post(opt, function(res){
            res.body.should.equal('{"status":"ok"}');
            done();
          })
        })
      })
    })

    describe('#joinApp()', function(){
      var opt = clone(tpl);
      opt.path = '/join';
      opt.headers['user-agent'] = '1';
      it('should response false', function(done){
        opt.headers.cookie = COOKIE_2;
        opt.data = {
          domain : 'test1',
          _csrf : CSRF_2
        }
        Post(opt, function(res){
          res.body.should.equal('{"done":false}');
          done();
        })
      })
      it('should response ok', function(done){
        opt.data.domain = 'test';
        Post(opt, function(res){
          res.body.should.equal('{"done":true}');
          done();
        })
      })
    })

    describe('#agreeCoop()', function(){
      var opt = clone(tpl);
      it('should response wrong', function(done){
        opt.path = '/application/manage/test4/agreeCoop';
        opt.headers.cookie = COOKIE_1;
        opt.data = {
          email : 'user1@qq.com',
          _csrf : CSRF_1
        }
        Post(opt, function(res){
          var result = JSON.parse(res.body);
          result.status.should.equal('error');
          result.msg.should.equal('wrong email');
          done();
        })
      })
      it('should response ok', function(done){
        opt.path = '/application/manage/test5/agreeCoop';
        Post(opt, function(res){
          var result = JSON.parse(res.body);
          result.status.should.equal('ok');
          done();
        })
      })      
    })

    describe('#refuseCoop()', function(){
      var opt = clone(tpl);
      it('should response delete done', function(done){
        opt.path = '/application/manage/test6/refuseCoop';
        opt.headers.cookie = COOKIE_1;
        opt.data = {
          _csrf : CSRF_1,
          email : 'user1@qq.com'
        }
        Post(opt, function(res){
          res.body.should.include('{"status":"ok"}');
          done();
        })
      })
    })

    describe('#deleteCoop()', function(){
      var opt = clone(tpl);
      it('should response  error', function(done){
        opt.path = '/application/manage/test5/deleteCoop';
        opt.headers.cookie = COOKIE_1;
        opt.data = {
          _csrf : CSRF_1,
          email : 'user1@qq.com'
        }
        Post(opt, function(res){
          res.body.should.include('{"done":true}');
          done();
        })
      })
    })

  /***
  *   middleware test
  */
    describe('#checkAuth()', function(){
      var opt = clone(tpl);
      it('should response permission dinied', function(done){
        opt.path = '/application/manage/test1/sum';
        opt.headers.cookie = COOKIE_2;
        opt.headers['user-agent'] = '1';
        Get(opt, function(res){
          res.body.should.include('没有权限访问这个应用');
          done();
        })
      })
      it('should response permission ok', function(done){
        opt.path = '/application/manage/test/sum';
        Get(opt, function(res){
          res.body.should.include('汇总信息');
          done();
        })
      })
    })

    describe('#checkChangeAuth()', function(){
      var opt = clone(tpl);
      it('should response permission dinied', function(done){
        opt.path = "/application/manage/test/appmng";
        opt.headers.cookie = COOKIE_2;
        opt.headers['user-agent'] = '1';
        opt.data = {_csrf:CSRF_2};
        Post(opt, function(res){
          res.body.should.include('没有权限进行这个操作');
          done();
        })
      })
      it('should response permission ok', function(done){
        opt.path = '/application/manage/test/todo/new';
        Post(opt, function(res){
          res.body.should.not.include('没有权限进行这个操作');
          done();
        })
      })
    })

    describe('#deleteCoop()', function(){
      var opt = clone(tpl);
      it('should response ok', function(done){
        opt.path = '/deleteCoop';
        opt.headers.cookie = COOKIE_2;
        opt.headers['user-agent'] = '1';
        opt.data = {
          _csrf:CSRF_2,
          domain : 'test'  
      };
      Post(opt, function(res){
        res.body.should.equal('{"done":true}');
        done();
      })
      })
    })
  })