var middleware = require('../src/routes/middleware');
var mock = require('./helper/mock');

var testDone = mock.testEvent,
    req = new mock.Request(),
    res = new mock.Response();

describe('route\'s middleware', function(){

  describe('#hasLogin()', function(){
    beforeEach(function(){
      req.session = {};
      req.url = "";
      req.headers = {};
    })
    
    it('should work fine has session', function(done){
      req.session.email = 'dead_hores@qq.com';
      req.session.nickName = 'dead_horse';
      middleware.hasLogin(req, res, done);
    })
    
    it('should work fine without session', function(done){
      req.session.email = "dead_horse@qq.com";
      req.headers.host = "cnodejs.net";
      req.url = "/application";
      testDone.once('done', function(page){
        page.should.equal('/login?redirect_url='+encodeURIComponent('http://cnodejs.net/application'));
        done();
      })
      middleware.hasLogin(req, res, function(){});
    })
  })

  describe('#hasNotLogin()', function(){
    beforeEach(function(){
      req.session = {};
      req.headers = {};
      req.body = {};
    })
    it('should work fine with out session', function(done){
      middleware.hasNotLogin(req, res, done);
    })
    it('should work fine with session', function(done){
      req.session.nickName = "dead_horse";
      testDone.once('done', function(page){
        page.should.equal('/application');
        done();
      })
      middleware.hasNotLogin(req, res,function(){});
    })
  })

  describe('#isAdmin()', function(){
    it('should work fine when is admin', function(done){
      req.session.email = "dead_horse@qq.com";
      middleware.isAdmin(req, res, done);
    })

    it('should work fine when is admin', function(done){
      req.session.email = "dead_horse1@qq.com";
      testDone.once('done', function(page){
        page.should.equal('/application');
        done();
      })
      middleware.isAdmin(req, res, function(){});
    })
  })
})