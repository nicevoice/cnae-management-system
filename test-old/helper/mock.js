var ep = require("EventProxy.js").EventProxy;

//mockRes && mockReq
var testEvent = exports.testEvent = new ep();
exports.Response = function(){
  this.render = function(page, data){
    testEvent.fire('testNow', {
      page:page,
      data:data
    });
  }
  
  this.sendJson = function(data){
    testEvent.fire('testNow', data);
    
  }
  this.redirect = function(page){
    testEvent.fire('testNow', page);
  }
}
exports.Request = function(){
  this.body = {};
  this.session = {};
  this.params = {};
}
