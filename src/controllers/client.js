var config = require('../config');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');

exports.upload = function(req , res){
  var form = req.form,
      savePath = path.join(path.dirname(__dirname), 'client', form.files.upload.name);
  utils.upload(form, savePath, function(data){
    if(data.error==='true'){
      return res.render('error', {message:'上传失败:'+data.msg});
    }else{
      return res.redirect('/monitor');
    }
  })
}