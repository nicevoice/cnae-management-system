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
    port = config.socketPort;
/**
 * 验证
 */
 var regs = {
      email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      domain : /^([a-z])[a-z0-9_]{3,19}/,
      password : /^(.){6,}$/,
      name : /^([a-zA-Z0-9._\-]){1,20}$/,
      mobile : /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5|8)\d{9}$/,
      url : /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(:(\d)+)?(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?$/,
      githubCode : /^(git:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
      npm : /^[\w\d.-]+/,
      githubPage : /^(https:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
      imgSource : /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(:(\d)+)?(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?(\.jpg|\.png|\.bmp|\.jpeg|\.gif)$/,
      files : /^[\w\u4E00-\u9FA5\ \=\+\#\/\^\%\,\~\-\_\.\*\?\[\]]+$/,
      gitAction : /^git[^|&]+$/,
      gitClone : /^git +clone/
  };
exports.verify = function(type, str){
    return regs[type].test(str);
  }
exports.match = function(type, str){
    return str.match(regs[type]);
}
/**
 * md5
 */

exports.hex_md5 = function(s){
    var hash = crypto.createHash('md5');
    var buffer = new Buffer(s, 'utf-8');
    hash.update(buffer);
    return hash.digest('hex');
}

/**
 * random string
 */
var str = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var strNum = str+"1234567890";
function getRandomNum(str){
   return (Math.floor(Math.random()*str.length));
}

exports.getRandomString = function(length){
   var s = str.split("");
   var result = "";
   for(var i=0; i!=length; ++i){
      result+=s[getRandomNum(str)];
   }
   return result;
}
exports.getRandomStringNum = function(length){
   var s = strNum.split("");
   var result = "";
   for(var i=0; i!=length; ++i){
      result+=s[getRandomNum(strNum)];
   }
   return result;
}

/*
 * get cookie
 */
var getFromCookie = function(str, name, sign) {
    if(!str) {
        return null;
    }
    if(!sign){
        sign = ';';
    }
    var paramIndex = str.indexOf(name + '=');
    if(paramIndex == -1){
        return null;
    }
    var value;
    var beginIndex = paramIndex + name.length + 1;
    var endIndex = str.indexOf(sign, beginIndex);
    if(endIndex == -1){
        value = str.substring(beginIndex);
    }else{
        value = str.substring(beginIndex, endIndex);
    }
    return value;
};
/** 
 * clone object
 */
var clone = exports.clone = function(obj){
    var newObj = {};
    Object.keys(obj).forEach(function(key){
        newObj[key] = obj[key]
    });
    return newObj;
}
exports.checkTBSession = function(req, cb){
     var sessionId = getFromCookie(req.headers.cookie, "cookie2") || '';
    //检查用户是否是开发者
    var secret = unescape(labsConf.secret);
    var checkUserOption = clone(labsConf.checkUserOption);
    checkUserOption.path += "?sessionId="+encodeURIComponent(sessionId)+"&sign="+md5(secret + sessionId + secret).toUpperCase();
    httpReq(checkUserOption, function(checkRes){
          cb(checkRes);
    });
}

/**
 * socket to nae
 */    
exports.onOff = function(action, name, callback){
    var socket = net.createConnection(port);
    socket.on('error',function(e){
        log.error(e.message);
        socket.destroy();
        callback({msg:e.message});
    });
    socket.write(action + " "+ name +"\n");
    socket.on('data', function(data){
    data = ""+data;
    if(data.indexOf('}')===-1){
        data === "{}";
    }else{
        data = JSON.parse(data);
    }
    callback(data);
    socket.destroy();
    })
};


exports.getLog = function(action, name, num, callback){
    var socket = net.createConnection(port);
    socket.on('error',function(e){
        log.error(e.message);
        socket.destroy();
        callback("");
    });
    socket.write(action+" "+name+" "+num+"\n");
    var res="", length=-1;
    socket.on('data', function(data){
            if(length===-1){
                length = data.slice(0,10).readInt32BE(0);
                res+=data.slice(10);
            }else{
                res += data;
            }
            if(res.length>=length){
                socket.destroy();
                callback(res);
            }
    });
    socket.on('end', function(){
        callback(res||'');
        socket.destroy();
    })
}

/**
 *  http request
 */
var request_timer = null, req = null;
// 请求5秒超时

var httpReq = exports.httpReq = function(options, callback){
    request_timer = setTimeout(function() {
    req.abort();
    console.log('Request Timeout.');
    }, 5000);
    req = http.request(options, function(res) {
    clearTimeout(request_timer);

    // 等待响应60秒超时
    var response_timer = setTimeout(function() {
        res.destroy();
        callback({done:false, warn:"响应超时"});
    }, 60000);

    var chunks = [];
    res.on('data', function(chunk) {
        chunks.push(chunk);
    });
 res.on('end', function() {
        clearTimeout(response_timer);
        var data = "";
        // 延后copy
        for(var i=0, size=chunks.length; i<size; i++) {
            data += chunks[i];
        }
        try{
        var jsonData = JSON.parse(data);
        }catch(e){
          return callback(data);
        }
        callback(jsonData);
    });
}).on('error', function(e) {
    // 响应头有错误
    clearTimeout(request_timer);
    console.log("Got error: " + e.message);
    callback(e.message);
});
if(options.data){
    req.write(options.data.toString());
}
req.end();
}

/**
* 生成github公私钥，更新配置文件
*/
function tplReplace(tpl, params){
    return tpl.replace(/\$.*?\$/g, function(data){
        return params[data];
    });
}
var arrConfig = [];
var githubProxy = new EventProxy(), working=false;
(function(){
githubProxy.on('addGithub', function(data){
	arrConfig.push(data);
	if(working) return;
	working = true;
	writeConf();
})
})()
var i=0;
var configFile = config.github.config;
var writeConf = function(){
  var config = arrConfig.shift();
  if(!config){
   return working = false;
  }
  configFd = fs.openSync(configFile, 'a', '644');
  var buffer = new Buffer(config, 'utf8');
  fs.write(configFd, buffer, 0, buffer.length, 0, function(err){
    if(err){
      log.error(err.toString());
      arrConfig.push(config);
    }
    fs.closeSync(configFd);
    writeConf();
  })
}
exports.addGithub = function(email, githubEmail, cb){
  var token = exports.getRandomStringNum(20),
      github = config.github;
  exec(github.genKey+" "+githubEmail + " "+token, function(err, stdout, stderr){
    if(err){
      return cb(err);
    }	
    var configInfo = tplReplace(github.tplConfig, {
    	'$email$':email,
    	'$token$':token,
    	'$file$':github.keyDir+token
    	});
    githubProxy.fire('addGithub', configInfo);
    cb(null, {
    	status:"ok",
    	content:{
    	  email:githubEmail,
    	  token:token,
    	  pubKey:fs.readFileSync(github.keyDir+token+'.pub', 'utf8')
    	  }
    	});
  });
}

/**
* git clone
*/
function doGitClone(command, targetDir, cb){
	      if(typeof targetDir!== 'string'){
	      	  return cb({
	      	  	  status:"error",
	      	  	  msg:"错误的目标文件夹"
	      	  	});
	      	}
  var tempDirLast = exports.getRandomStringNum(15),
      gitClone =command + " " + tempDir + "/" + tempDirLast, 
      savePath = uploadDir + '/' + targetDir||'' + '/',
      move = __dirname.slice(0, __dirname.lastIndexOf("/") + 1) + "shells/cpall.sh " + tempDir + '/' + tempDirLast + " " + savePath;
  exec(gitClone, function(err, gitStdout, gitStderr) {
    if(err) {
      log.error(err.toString());
      exec("rm -rf " + tempDir + "/" + tempDirLast, function() {
      });
      return cb({
        status : "error",
        msg : err.toString()
      });
    } else {
      fs.mkdir(savePath, '777', function(err) {
        exec(move, function(err) {
          if(err && err.toString().indexOf("no matches found") === -1) {
            log.error(err.toString());
            return cb({
              status : "error",
              msg : err.toString()
            });
          } else {
            exec("rm -rf " + tempDir + "/" + tempDirLast, function() {
            });
            return cb({
              status : "ok",
              msg : gitStdout
            });
          }
        })
      })
    }
  })
}

function gitOtherAction(command, targetDir, cb){	
  var cwd = process.cwd(),
  		savePath = uploadDir + '/' + targetDir + '/';
  command = 'cd '+ savePath + '&&' + command;
  exec(command, function(err, gitStdout, gitStderr) {
    if(err) {
      log.error(err.toString());
      return cb({
        status : "error",
        msg : err.toString()
      });
    } else {
      return cb({
        status : "ok",
        msg : gitStdout
      });
    }
  })
}
/**
* do git
*/
exports.doGit = function(command, targetDir, cb, isClone){
	if(isClone){
	  doGitClone(command, targetDir, cb);  
	}else{
		gitOtherAction(command, targetDir, cb);
	}
}