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
  , urlMoudle = require('url')
  , randomStringNum = require('../lib/randomString').getRandomStringNum;
  
exports.showSquare = function(req, res){
  return res.render("appSquare", {layout:"layoutMain",
      nickName:req.session.nickName, email:req.session.email});
}

exports.post = function(req, res){
  console.log(req.session.email + ":square post");
  var queryString = urlMoudle.parse(req.url, true).query, skip = queryString.skip || '', limit = queryString.limit || '';
  app_basic.find({}, {
    sort: [['appCreateDate', -1]],
    skip: skip,
    limit: limit
  }).toArray(function(err, data){
    if (err) {
      console.log(err.toString());
      return res.render("error", {
        message: "数据库查询错误"
      });
    }
    else {
      return res.sendJson({
        apps: data
      });
    }
  })
} 