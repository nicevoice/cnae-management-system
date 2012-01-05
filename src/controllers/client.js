var config = require('../config');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');

exports.upload = function(req , res, next){
  var files = req.files;
  var savePath = path.join(path.dirname(__dirname), 'client', files.upload.name);
  utils.upload(files, savePath, function(data){
    if(data.error==='true'){
      return next(new Error('上传失败:'+data.msg));
    }else{
      return res.redirect('/monitor');
    }
  })
}
