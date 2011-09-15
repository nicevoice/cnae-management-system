var config = require('../config')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exec  = require('child_process').exec
  , randomString = require('../lib/randomString')
  , db = config.db
  , log = config.logWithFile
  , users = db.collection(config.db_user)
  , app_mem = db.collection(config.db_app_mem)
  , app_basic = db.collection(config.db_app_basic)
  , app_todo = db.collection(config.db_app_todo)
  , records = db.collection(config.db_app_records)
  , EventProxy = require('EventProxy.js').EventProxy  
  , uploadDir = config.uploadDir
  , randomStringNum = require('../lib/randomString').getRandomStringNum;
  
exports.showSquare = function(req, res){
  return res.render("appSquare", {layout:"layoutMain",
      nickName:req.session.nickName, email:req.session.email});
}

exports.post = function(req, res){
  return res.sendText('<div><a>数据</a></div>');
} 