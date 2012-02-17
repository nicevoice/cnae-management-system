//reqires
var crypto = require('crypto'),
    http = require('http'),
    net = require('net'),
    fs = require('fs'),
    exec = require('child_process').exec,
    EventProxy = require('EventProxy.js').EventProxy,
    config = require('../config'),
    log = config.logWithFile,
    labsConf = config.labsConf,
    tempDir = config.tempDir,
    uploadDir = config.uploadDir,
    portOnline = config.socketPortOnline;
/**
 * 验证
 */
var regs = {
  email: /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/,
  domain: /^([a-z])[a-z0-9_]{3,19}$/,
  password: /^(.){6,}$/,
  name: /^([a-zA-Z0-9._\-]){1,20}$/,
  mobile: /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5|8)\d{9}$/,
  url: /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i,
  githubCode: /^(git:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
  npm: /^[\w\d.-]+/,
  githubPage: /^(https:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
  imgSource: /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(:(\d)+)?(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?(\.jpg|\.png|\.bmp|\.jpeg|\.gif)$/,
  files: /^[\w\u4E00-\u9FA5\ \=\+\#\/\^\%\,\~\-\_\.\*\?\[\]]+$/,
  gitAction: /^git[^|&]+$/,
  gitClone: /^git +clone/
};
exports.verify = function(type, str) {
  return regs[type].test(str);
}
exports.match = function(type, str) {
  return str.match(regs[type]);
}
/**
 * md5
 */

exports.hex_md5 = function(s) {
  var hash = crypto.createHash('md5');
  var buffer = new Buffer(s, 'utf-8');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * random string
 */
var str = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var strNum = str + "1234567890";

function getRandomNum(str) {
  return (Math.floor(Math.random() * str.length));
}

exports.getRandomString = function(length) {
  var s = str.split("");
  var result = "";
  for (var i = 0; i != length; ++i) {
    result += s[getRandomNum(str)];
  }
  return result;
}
exports.getRandomStringNum = function(length) {
  var s = strNum.split("");
  var result = "";
  for (var i = 0; i != length; ++i) {
    result += s[getRandomNum(strNum)];
  }
  return result;
}

/*
 * get cookie
 */
var getFromCookie = function(str, name, sign) {
    if (!str) {
      return null;
    }
    if (!sign) {
      sign = ';';
    }
    var paramIndex = str.indexOf(name + '=');
    if (paramIndex == -1) {
      return null;
    }
    var value;
    var beginIndex = paramIndex + name.length + 1;
    var endIndex = str.indexOf(sign, beginIndex);
    if (endIndex == -1) {
      value = str.substring(beginIndex);
    } else {
      value = str.substring(beginIndex, endIndex);
    }
    return value;
    };
/** 
 * clone object
 */
var clone = exports.clone = function(obj) {
    var newObj = {};
    Object.keys(obj).forEach(function(key) {
      newObj[key] = obj[key]
    });
    return newObj;
    }
    
exports.checkTBSession = function(req, cb) {
  var sessionId = getFromCookie(req.headers.cookie, "cookie2") || '';

  //检查用户是否是开发者
  var secret = unescape(labsConf.secret);
  var checkUserOption = clone(labsConf.checkUserOption);
  checkUserOption.path += "?sessionId=" + encodeURIComponent(sessionId) + "&sign=" + exports.hex_md5(secret + sessionId + secret).toUpperCase();
  httpReq(checkUserOption, function(checkRes) {
    cb(checkRes);
  });
}

/**
 * socket to nae
 */
exports.onOff = function(action, name, callback, port) {
  port = port || config.socketPort; // default is dev
  var socket = net.createConnection(port);
  socket.on('error', function(e) {
    log.error(e.message);
    socket.destroy();
    callback({
      msg: e.message
    });
  });
  socket.write('{"cmd":"' + action + '", "app":"' + name + '", "v":"'+ config.naeClientVersion+'"}\n');
  socket.on('data', function(data) {
    data = "" + data;
    try {
      data = JSON.parse(data);
    } catch (e) {
      log.error(e.toString());
      data = {
        status: "error",
        msg: "response is not json"
      };
    }
    callback(data);
    socket.destroy();
  })
};

var NEWLINE = '\n';  //\n
exports.getLog = function(action, name, num, callback){
    var socket = net.createConnection(portOnline);
    socket.on('error',function(e){
        log.error(e.message);
        socket.destroy();
         callback("");
    });
    socket.write('{"cmd":"'+action+'", "app":"'+name+'", "size":"'+num+'", "v":"'+ config.naeClientVersion+'"}\n');
    var buf = "", length = -1, head;
    socket.on('data', function(data){
      buf += data;
      if(length===-1){//still dons't find head
        var l=0;
        for(var len=buf.length; l!=len; ++l){
          if(buf[l]===NEWLINE) break;
        }
        if(l===buf.length){//not found 
          return;
        }
        try{//try to get length in head
          head = JSON.parse(buf.slice(0, l));
        }catch(e){
          length = 0;
        }
        if(head){
          length = head.length||0;
        }else{
          length = 0;
        }
        buf = buf.slice(l+1);
      }
    //  console.log(Buffer.byteLength(buf, 'utf8'), length);
      if(length!==-1 && Buffer.byteLength(buf, 'utf8') >= length){ //done
        socket.end();
      }
    });
    socket.on('end', function(){
        callback(buf||'');
        socket.end();
    })
}
/**
 *  http request
 *  type : json | string
 */
var request_timer = null,
    req = null;
// 请求5秒超时
var httpReq = exports.httpReq = function(options, callback, type) {
    type = type||'json';//默认返回为json
    request_timer = setTimeout(function() {
      req.abort();
      console.log('Request Timeout.');
    }, 5000);
    req = http.request(options, function(res) {
      clearTimeout(request_timer);

      // 等待响应60秒超时
      var response_timer = setTimeout(function() {
        res.destroy();
        callback({
          done: false,
          warn: "响应超时"
        });
      }, 60000);

      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });
      res.on('end', function() {
        clearTimeout(response_timer);
        var data = "";
        // 延后copy
        for (var i = 0, size = chunks.length; i < size; i++) {
          data += chunks[i];
        }
        if(type==='json'){
          try {
            var jsonData = JSON.parse(data);
          } catch (e) {
            return callback({status:"error", msg:"response not json"});
          }
          return callback(jsonData);
        }
        if(type==='string'){
          return callback(data);
        }
        callback();
      });
    }).on('error', function(e) {
      // 响应头有错误
      clearTimeout(request_timer);
      console.log("Got error: " + e.message);
      callback(e.message);
    });
    if (options.data) {
      try{
        req.write(JSON.stringify(options.data));
      }catch(err){
      }
    }
    req.end();
    }
    
    
    /**
     * 生成github公私钥，更新配置文件
     */
function tplReplace(tpl, params) {
  return tpl.replace(/\$.*?\$/g, function(data) {
    return params[data];
  });
}
var arrConfig = [];
var githubProxy = new EventProxy(),
    working = false;
(function() {
  githubProxy.on('addGithub', function(data) {
    arrConfig.push(data);
    if (working) return;
    working = true;
    writeConf();
  })
})()
var i = 0;
var configFile = config.github.config;
var writeConf = function() {
    var config = arrConfig.shift();
    if (!config) {
      return working = false;
    }
    fs.open(configFile, 'a', '644', function(err, configFd){
      if(err){
        log.error(err.toString());
        arrConfig.push(config);
        return ;
      }
      var buffer = new Buffer(config, 'utf8');
      fs.write(configFd, buffer, 0, buffer.length, 0, function(err) {
        if (err) {
          log.error(err.toString());
          arrConfig.push(config);
        }
        fs.close(configFd, function(){});
        writeConf();
      })
    });
  }
    
exports.addGithub = function(email, githubEmail, cb) {
  var token = exports.getRandomStringNum(20),
      github = config.github;
  exec(github.genKey + " " + githubEmail + " " + github.keyDir + token, function(err, stdout, stderr) {
    console.log(arguments);
    if (err) {
      return cb(err);
    }
    var configInfo = tplReplace(github.tplConfig, {
      '$email$': email,
      '$token$': token,
      '$file$': github.keyDir + token
    });
    githubProxy.fire('addGithub', configInfo);
    fs.readFile(github.keyDir+token+'.pub', 'utf8', function(err, pubKey){
      if(err){
        log.error(err.toString());
        return cb(err);
      }
      cb(null, {
        status: "ok",
        content: {
          email: githubEmail,
          token: token,
          pubKey: pubKey
        }
      });
    })
  });
}

/**
 * git clone
 */

function doGitClone(command, targetDir, cb) {
  if (typeof targetDir !== 'string') {
    return cb({
      status: "error",
      msg: "错误的目标文件夹"
    });
  }
  var tempDirLast = exports.getRandomStringNum(15),
      gitClone = command + " " + tempDir + "/" + tempDirLast,
      savePath = uploadDir + '/' + targetDir || '' + '/',
      move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + tempDirLast + " " + savePath;
  exec(gitClone, function(err, gitStdout, gitStderr) {
    if (err) {
      log.error(err.toString());
      exec("rm -rf " + tempDir + "/" + tempDirLast, function() {});
      return cb({
        status: "error",
        msg: err.toString()
      });
    } else {
      fs.mkdir(savePath, '777', function(err) {
        exec(move, function(err) {
          if (err && err.toString().indexOf("no matches found") === -1) {
            log.error(err.toString());
            return cb({
              status: "error",
              msg: err.toString()
            });
          } else {
            exec("rm -rf " + tempDir + "/" + tempDirLast, function() {});
            return cb({
              status: "ok",
              msg: gitStdout
            });
          }
        })
      })
    }
  })
}

function gitOtherAction(command, targetDir, cb) {
  var cwd = process.cwd(),
      savePath = uploadDir + '/' + targetDir + '/',
      proxy = new EventProxy();
  var git = function(hasGit) {
      if (!hasGit) {
        return cb({
          status: "error",
          msg: "没有关联github\n"
        })
      }
      command = 'cd ' + savePath + '&&' + command;
      exec(command, function(err, gitStdout, gitStderr) {
        if (err) {
          log.error(err.toString());
          return cb({
            status: "error",
            msg: err.toString()
          });
        } else {
          return cb({
            status: "ok",
            msg: gitStdout
          });
        }
      })
      }
      
  proxy.once('git_gotten', git);
  if (command.indexOf('git init') >= 0) {
    proxy.fire('git_gotten', true);
  } else {
    fs.stat(savePath + '/.git', function(err, stat) {
      if (!err && stat.isDirectory()) {
        proxy.fire('git_gotten', true);
      } else {
        proxy.fire('git_gotten', false);
      }
    });
  }
}
/**
 * do git
 */
exports.doGit = function(command, targetDir, cb, isClone) {
  if (isClone) {
    doGitClone(command, targetDir, cb);
  } else {
    gitOtherAction(command, targetDir, cb);
  }
}

exports.upload = function(files, savePath, cb){
  var filePath = files.upload ? files.upload.filename : null;
  if(!filePath) {
    return cb({
      error:"true",
      msg:"invalid filePath"
    })
  }

  fs.rename(files.upload.path, savePath, function(err){
    if(err){
      log.error(err.toString());
      return cb({
        error:"true",
        msg:"rename file error"
      });
    }
    cb({
      error:"false",
      msg:"succeed"
    })
  })
}
