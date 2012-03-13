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
/**
 * keep the token to checkAuth
 */
var token;
describe('command line controller test', function(){
 	before(function(){
 		app.listen(1130);
 	})

 	describe('#getToken()', function(){
 		var opt = clone(tpl);
 		it('should response miss param : email', function(done){ 			
 		  opt.path = '/commandline/token';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(2);
        done();
      })
 		})
    it('should response miss param : password', function(done){
      opt.path = "/commandline/token?email=test";
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(3);
        done();
      })
    })
    it('should response email format error', function(done){
      opt.path = "/commandline/token?email=test&password=123";
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(4);
        done();
      })
    })
    it('should response wrong email or password', function(done){
      opt.path = "/commandline/token?email=test@gmail.com&password=123";
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(5);
        done();
      })     
    })
    it('should response get token ok', function(done){
      opt.path = "/commandline/token?email=dead_horse@qq.com&password=test12";
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(0);
        token = result.token;
        token.should.have.length(30);
        done();
      })           
    })
 	})

  describe('#checkAuth()', function() {
    var opt = clone(tpl);
    it('should response missing email', function(done) {
      opt.path = '/commandline/permission';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(1);
        done();
      })
    });
    it('should response missing app', function(done) {
      opt.path = '/commandline/permission?email=test';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(2);
        done();
      })
    });
    it('should response missing token', function(done) {
      opt.path = '/commandline/permission?email=test&app=test';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(3);
        done();
      })
    });
    it('should response missing email', function(done) {
      opt.path = '/commandline/permission?email=test&app=test&token=123';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(4);
        done();
      })
    });
    it('should response wrong token', function(done) {
      opt.path = '/commandline/permission?email=test@gmail.com&app=test&token=123';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(6);
        done();
      })
    });
    it('should response forbidden', function(done) {
      opt.path = '/commandline/permission?email=dead_horse@qq.com&app=test123&token='+token;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(7);
        done();
      })
    });
    it('should response ok', function(done) {
      opt.path = '/commandline/permission?email=dead_horse@qq.com&app=test&token='+token;
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        done();
      })
    });
  })

  describe('#sendMail()', function() {
    var opt = clone(tpl);
    it('should response T_T', function(done) {
      opt.path = '/commandline/warn?psw=12345';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(1);
        done();
      })
    })
    it('should response wrong app domain', function(done) {
      opt.path = '/commandline/warn?psw=123&app=sdfas&msg=1';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.code.should.equal(3);
        done();
      })
    })
    it('should response ok', function(done) {
      opt.path = '/commandline/warn?psw=123&app=test&msg=1';
      Get(opt, function(res){
        var result = JSON.parse(res.body);
        result.status.should.equal('ok');
        done();
      })
    })
  })
  after(function() {
    app.close();
  })
})