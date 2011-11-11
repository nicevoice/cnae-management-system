var testCase = require('nodeunit').testCase,
    socket = require('../../src/lib/socket'),
    onOff = socket.onOff,
    getLog = socket.getLog;
module.exports = testCase({
  setUp : function(callback){
    callback();
  },
  tearDown : function(callback){
    callback();
  },
  test_connection_start_exsit : function(test){
    var action = "start",
        app = "unittest";
        onOff(action, app, function(data){
          test.deepEqual({status:data.status, code:data.code},
            {status:"ok", code:101}, "start exsist error");
          test.done();
        })
  },
  test_connection_start_not_exsit:function(test){
    var action = "start",
        app = "unittest1";
        onOff(action, app, function(data){
          test.deepEqual({status:data.status, code:data.code},
            {status:"error", code:101}, "start not exsist error");
          test.done();
        });    
  },
  test_connection_start_running:function(test){
    var action = "start",
        app = "unittest";
        onOff(action, app, function(data){
          test.deepEqual({status:data.status, code:data.code},
            {status:"error", code:101}, "start not exsist error");
          test.done();
        });        
  }
})
