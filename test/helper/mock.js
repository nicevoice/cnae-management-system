var ep = require("EventProxy.js").EventProxy;

//mockRes && mockReq
var testEvent = exports.testEvent = new ep();
exports.Response = function(){
  this.render = function(page, data){
    testEvent.fire('done', {
      page:page,
      data:data
    });
  }
  
  this.sendJson = function(data){
    testEvent.fire('done', data);
  }

  this.json = this.sendJson;

  this.redirect = function(page){
    console.log('redirect')
    testEvent.fire('done', page);
  }
}
exports.Request = function(){
  this.body = {};
  this.session = {};
  this.params = {};
  this.headers = {};
}
