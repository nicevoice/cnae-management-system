var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var config = require('../config');
var Step = require('../lib/step');

const LANG_YES = "y";
const LANG_NO = "n";

const LANG_SUCCEED = "succeed";
const LANG_FAILED = "failed";
const LANG_ERROR = "error";

const ROOT_PATH = config.uploadDir; // 应用的根目录

function setError(errMsg) {
    if (typeof errMsg != "string")
        return null;
    var err = {};
    err.status = LANG_ERROR;
    err.content = errMsg;
    return err;
}

function getPath(domain, pt){
    var realPath = path.join(ROOT_PATH, domain, pt);
    var domainPath = path.join(ROOT_PATH, domain)+'/';
    return realPath.indexOf(domainPath)===0 ? realPath : null;
}
exports.index = function(req, res) {
    var domain = req.params.id;
    res.render("editor", {
                domain : domain,
                layout : false
            });
}

/*
 * 读目录下的文件 dirPath示例：foo/bar
 */
exports.listfile = function(req, res) {
    var resMsg = {
        status : LANG_ERROR,
        content : null
    };
    var dirPath = req.body.dirPath || "/";
    var domain = req.params.id;
    dirPath = getPath(domain, dirPath);
    if(!dirPath){
        return res.json(setError('permission denied'), 200);
    }
    fs.readdir(dirPath, function(err, items) {
                if (err)
                    return res.json(setError("failed to read dir"), 200);
                // 格式化输出的内容
                var itemList = new Array();
                //var regExp = /^\.|~$/;
                var regExp = /^((\.naeindex)|(\.naelock)|(\.nae.tmp)|(\.git))$/
                var i = 0; // counter
                for (var k in items) {
                    // 过滤nae client不允许修改的文件
                    if (regExp.test(items[k]))
                        continue;
                    var _f = {};
                    _f.name = items[k]; // 文件名
                    // 文件类型
                    try {
                        var _stat = fs.statSync(path.join(dirPath, _f.name));
                        if (_stat.isFile())
                            _f.type = 'f';
                        else if (_stat.isDirectory())
                            _f.type = 'd';
                        else
                            continue; // 只显示文件和文件夹
                        _f.atime = _stat.atime; // access time
                        _f.mtime = _stat.mtime; // modification time
                        _f.ctime = _stat.ctime; // inode change time
                        _f.size = _stat.size;
                        itemList[i++] = _f;
                    } catch (e) {
                        continue;
                    }
                }
                resMsg.status = LANG_SUCCEED;
                resMsg.content = itemList;
                return res.json(resMsg, 200);
            });
}

/*
 * 移除UTF-8编码文件的BOM签名
 */
function rmBom(content) {
    if (content.charCodeAt(0) == 65279) {
        return content.substring(1);
    } else {
        return content;
    }
}

/*
 * 将换行符转换成UNIX格式的
 */
function chFileFormat(content) {
    var regExp = /[\r\n]+/g;
    return content.replace(regExp, "\n");
}

/*
 * 读取文件内容
 */
exports.readfile = function(req, res) {
    var resMsg = {
        status : LANG_ERROR,
        content : null
    };
    var filePath = req.body.filePath || '/';
    var domain = req.params.id;
    filePath = getPath(domain, filePath);
    if(!filePath){
        return res.json(setError('permission denied'), 200);
    }
    fs.readFile(filePath, "utf8", function(err, data) {
                if (err)
                    return res.json(setError("failed to read file"), 200);
                resMsg.status = LANG_SUCCEED;
                resMsg.content = rmBom(chFileFormat(data));
                return res.json(resMsg, 200);
            });
}

/*
 * 写文件
 */
exports.writefile = function(req, res) {
    var resMsg = {
        status : LANG_ERROR,
        content : null
    };
    var filePath = req.body.filePath||'/';
    var content = req.body.content||'';
    var domain = req.params.id;
    filePath = getPath(domain, filePath);
    if(!filePath){
        return res.json(setError('permission denied'), 200);
    }
    fs.writeFile(filePath, content, function(err) {
                if (err)
                    return res.json(setError("failed to write file"), 200);
                // 获取文件最新的mtime
                fs.stat(filePath, function(err, stats) {
                            if (err)
                                return res.json(
                                        setError("failed to get file stats"),
                                        200);
                            resMsg.mtime = stats.mtime;
                            resMsg.status = LANG_SUCCEED;
                            resMsg.filePath = filePath;
                            return res.json(resMsg, 200);
                        });
            });

}

/*
 * 重命名文件
 */
exports.renamefile = function(req, res) {
  var resMsg = {
      status : LANG_ERROR
  };
  var oriPath = req.body.oriPath||'/'; // 文件原路径
  var newPath = req.body.newPath||'/'; // 文件新路径
  var domain = req.params.id;
  oriPath = getPath(domain, oriPath);
  newPath = getPath(domain, newPath);
  if(!oriPath || !newPath){
      return res.json(setError('permission denied'), 200);
  }  
  Step(
    function checkExist(){
      if(oriPath!==newPath){
        path.exists(newPath, this);
      }else{
        return res.json({status:LANG_SUCCEED}, 200);
      }
    },
    function rename(err, exist){
      if(err||exist){
        return res.json(setError('rename conflict'), 200);
      }
      fs.rename(oriPath, newPath, this);
    },
    function getStat(err){
      if(err){
        return res.json(setError("failed to rename file"), 200);
      }
      fs.stat(newPath, this);
    },
    function(err, stats){
      if(err){
        return res.json(setError("failed to get file stats"),200);
      }
      resMsg.mtime = stats.mtime;
      resMsg.status = LANG_SUCCEED;
      resMsg.filePath = newPath;
      return res.json(resMsg, 200);
    }
  ) 
}

/*
 * 删文件
 */
exports.delfile = function(req, res) {
    var resMsg = {
        status : LANG_ERROR
    };
    var filePath = req.body.filePath;
    var domain = req.params.id;
    filePath = getPath(domain, filePath);
    if(!filePath){
      return res.json(setError('permission denied'), 200);
    }
    fs.unlink(filePath, function(err) {
                if (err)
                    return res.json(setError("failed to remove file"), 200);
                resMsg.status = LANG_SUCCEED;
                return res.json(resMsg, 200);
            });
}

/*
 * 创建目录
 */
exports.mkdir = function(req, res) {
    var resMsg = {
        status : LANG_ERROR
    };
    var dirPath = req.body.dirPath;
    var domain = req.params.id;
    dirPath = getPath(domain, dirPath);
    if(!dirPath){
      return res.json(setError('permission denied'), 200);
    }
    fs.mkdir(dirPath, 0755, function(err) {
                if (err)
                    return res.json(setError("failed to make dir"), 200);
                resMsg.status = LANG_SUCCEED;
                return res.json(resMsg, 200);
            });
}

/*
 * 删目录
 */
exports.deldir = function(req, res) {
    var resMsg = {
        status : LANG_ERROR
    };
    var dirPath = req.body.dirPath;
    var domain = req.params.id;
    dirPath = getPath(domain, dirPath);
    if(!dirPath){
      return res.json(setError('permission denied'), 200);
    }
    rimraf(dirPath, function(err) {
                if (err)
                    return res.json(setError("failed to remove dir"), 200);
                resMsg.status = LANG_SUCCEED;
                return res.json(resMsg, 200);
            });
}

exports.querytool = function(req, res) {
    var domain = req.params.id;
    res.render("querytool", {domain:domain, email:req.session.email, layout : false});
}
