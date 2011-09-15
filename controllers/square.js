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
  app_basic.find({}, {  //找出最新的limit个应用
    sort: [['appCreateDate', -1]],
    skip: skip,
    limit: limit
  }).toArray(function(err, data){
    if (err) {
      console.log("not find apps");
      console.log(err.toString());
      return res.sendJson({
        status: "error",
        msg: "数据获取失败"
      });
    }
    else {
      console.log("find apps");
      if (!data || data.length <= 0) {
        return res.sendJson({
          status: "done",
          msg: "所有数据获取完成"
        });
      }
      var domainToMems = {}, domains = [];  //domainToMems存放domain和mem的对应关系，用hash的形式， domains存放应用域名，便于app_mem查找
      for (var i = 0, len = data.length; i < len; ++i) {
        domains[i] = data[i].appDomain;
        domainToMems[domains[i]] = {};
        domainToMems[domains[i]].memberNums = 0;
      }
      app_mem.find({              //查找这limit个应用的参与者
        appDomain: {
          $in: domains
        }
      }).toArray(function(err, mems){
        if (err) {
          console.log("not find mems");
          console.log(err.toString());
          return res.sendJson({
            status: "error",
            msg: "数据获取失败"
          });
        }
        else {
          var creatorEmails = [];    
          for (var i = 0, len = mems.length; i < len; ++i) {
            domainToMems[mems[i].appDomain].memberNums ++;
            if(mems[i].role===0){
              domainToMems[mems[i].appDomain].creatorEmail = mems[i].email;
              creatorEmails.push(mems[i].email);
            }
          }
          for(var i=0, len=data.length; i<len; ++i){
            if (!domainToMems[data[i].appDomain]) {
              data[i].memberNums = "0";
              data[i].creatorEmail = "";
            }
            else {
              data[i].memberNums = domainToMems[data[i].appDomain].memberNums || 0;
              data[i].creatorEmail = domainToMems[data[i].appDomain].creatorEmail || "";
            }
          }
          console.log("find mems");
          console.log(creatorEmails);
          users.find({email:{$in:creatorEmails}},{email:1, nickName:1}).toArray(function(err, userInfos){
            if (err) {
              console.log("not find nick");
              console.log(err.toString());
              return res.sendJson({status:"error", msg:"数据获取失败"});
            }
            else 
              if (!userInfos || userInfos.length === 0) {
                console.log("not find nick 2");
                return res.sendJson({status:"error", msg:"数据获取失败"});
              }
              else 
                if (userInfos) {
                  var emailToNick = {};
                  for (var i = 0, len = userInfos.length; i < len; ++i) {
                    emailToNick[userInfos[i].email] = userInfos[i].nickName;
                  }
                  for (var i = 0, len = data.length; i < len; i++) {
                    if (emailToNick[data[i].email]) {
                      data[i].nickName = emailToNick[data[i].email];
                    }
                    else{
                      data[i].nickName = "";
                    }
                  }
                  console.log("find nick");
                  console.log(data.toString());
                  return res.sendJson({status:"ok", apps:data});
                }
              })
        }
      });
    }
  })
} 