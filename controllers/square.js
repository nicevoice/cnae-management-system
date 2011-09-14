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
    app_basic.find({}).toArray(function(err, data){
      if(err){
        console.log(err.toString());
        res.render("error",{message:"数据获取失败，请稍后再试"});
      }else{
        return res.render("main", {layout:"layoutMain",
        nickName:req.session.nickName, email:req.session.email});
      }
    })
  }
