var net = require('net');
var sio = require('socket.io');
var parseCookie = require('connect').utils.parseCookie;
var ep = require('EventProxy.js').EventProxy;
var config = require('../config');
var log = config.logWithFile;
//model
var findOne = require('../models/index').findOne;
var app_mem = config.dbInfo.collections.app_member;
    var i=0, j=0;

var Logs = function(app, getSession){
  this.appLogs = {};  //stream of app's logs
  this.proxy = new ep();
  this.io = require('socket.io').listen(app);
  this.io.set('log level', 1); 
  this.getSession = getSession;
  this.initEp();
  this.initAuth();
  this.initConn();
}

/***
*  init authorization for logs in socket.io
*/
Logs.prototype.initAuth = function(){
  var _self = this;
  this.io.set('authorization', function(data, accept){
    var proxy = new ep();
    //get sessionId from cookie & get session from sessionStore
    var parse = function(){
      if(data.headers.cookie){
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionId = data.cookie['connect.sid'];
        _self.getSession(data.sessionId, function(err, session){
          if(err || !session){
            proxy.unbind();
            return accept(err.toString(), false);
          }else{
            data.session = session;
            proxy.fire('session_got');
          }
        })
      }else{
        proxy.unbind();
        return accept('No cookie transmitted.', false);
      }
    }
    //get auth form database
    var checkAuth = function(){
      var referer = data.headers.referer;
      var arr = referer.match(/editor\/(\w+)/);
      data.appDomain = arr && arr[1];
      findOne(app_mem, {
        email : data.session.email,
        appDomain : data.appDomain},
        function(err, info){
          if(err){
            log.error(err.toString());
            return accept(err.toString(), false);
          }
          if(info.active===0||info.role>2){
            return accept('permission denied', false);
          }
          accept(null, true);
        })
    }
    proxy.once('session_got', checkAuth);
    parse();    
  })
}

/***
*  init the connect event of socket
*/
Logs.prototype.initConn = function(){
  var _self = this;
  this.io.sockets.on('connection', function(socket){  // some socket connect
    var hs = socket.handshake;
    //console.log(hs.appDomain, 'connected');
    if(!_self.appLogs[hs.appDomain]){
     // console.log('init room ', hs.appDomain );
      _self.createLogSocket(hs.appDomain);
      _self.appLogs[hs.appDomain].nums = 1;
    }else{
      ++_self.appLogs[hs.appDomain].nums;
      //_self.createLogSocket(hs.appDomain);
    }
    socket.join(hs.appDomain);
var sstdout = _self.appLogs[hs.appDomain].stdout;
    //console.log(hs.appDomain, sstdout);

    socket.on('message', function(msg){
      if(msg.indexOf('restart')===0){
        _self.destroyLogSocket([msg.slice(7)]);
      }
    })
    //some socket disconnect
    socket.on('disconnect', function(){
      //console.log(hs.appDomain, 'a socket disconnected');
      --_self.appLogs[hs.appDomain].nums;
      //console.log(_self.appLogs[hs.appDomain].nums);
      if(_self.appLogs[hs.appDomain].nums<=0){
        // console.log('room distroy ', hs.appDomain);
         _self.destroyLogSocket(hs.appDomain);
         delete _self.appLogs[hs.appDomain];
      }
    });
  });
}
Logs.prototype.destroyLogSocket = function(appDomain){
  this.appLogs[appDomain].stdout.end();
  this.appLogs[appDomain].stderr.end();
}
Logs.prototype._getLog = function(action, appDomain){
  var _self = this;
  var socket = net.createConnection(config.socketPort);
  socket.on('error',function(e){
        log.error(e.message);
        socket.destroy();
  });
  socket.write('{"cmd":"'+action+'", "app":"'+appDomain+'"}\n');
  socket.on('data', function(data){
    _self.proxy.fire(action, {appDomain:appDomain, data:data});
  })
  socket.on('close', function(data){
    //console.log('close');
    if(_self.appLogs[appDomain]&&_self.appLogs[appDomain].nums>0){
      _self.appLogs[appDomain][action.slice(0,6)] = _self._getLog(action, appDomain);
    }
  })
  return socket;
}
Logs.prototype.createLogSocket = function(appDomain){
    if(!this.appLogs[appDomain]){
      this.appLogs[appDomain] = {};
    }
    this.appLogs[appDomain].stdout = this._getLog('stdoutpipe', appDomain);
    this.appLogs[appDomain].stderr = this._getLog('stderrpipe', appDomain);
}

/***
* bind eventproxy's event&callback
*/
Logs.prototype.initEp = function(){
  //console.log('initEp');
  var _self = this;
  this.proxy.on('stdoutpipe', function(data){
    _self.io.sockets.in(data.appDomain).send("out"+data.data.toString());
  })
  this.proxy.on('stderrpipe', function(data){
    _self.io.sockets.in(data.appDomain).send("err"+data.data.toString());
  })
}
Logs.create = function(app, getSession){
  var logs = new Logs(app, getSession);
  return logs;
}
module.exports = Logs.create;
