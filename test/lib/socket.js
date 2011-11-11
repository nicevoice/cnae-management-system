var testCase = require('nodeunit').testCase,
    socket = require('../../src/lib/socket'),
    onOff = socket.onOff,
    getLog = socket.getLog;
module.exports = testCase({
  setUp : function(){
    callback();
  },
  tearDown : function(){
    callback();
  },
  test_on_ok : function(test){
    var action = "start",
        app = "testUnit";
        onOff(action, app, function(data){
          console.log(data);
          test.done();
        })
  },
})
