var mongo = require("mongoskin"),
    config = require("../config");
var db = exports.db = mongo.db(config.db_url),
    users = exports.users = db.collection(config.db_user),
    app_mem = exports.app_mem = db.collection(config.db_app_mem),
    app_basic = exports.app_basic = db.collection(config.db_app_basic),
    records = exports.records = db.collection(config.db_app_records),
    inviteCode = exports.inviteCode = db.collection(config.db_inviteCode);
    
exports.ensureIndexes = function(){
  users.ensureIndex({email:1, nickName:1}, {unique:true}, function(){console.log(arguments);});
  app_mem.ensureIndex({appDomain:1, email:1}, {unique:true}, function(){console.log(arguments);});
  app_basic.ensureIndex({appDomain:1}, {unique:true}, function(){console.log(arguments);});
  records.ensureIndex({appDomain:1}, {unique:true}, function(){console.log(arguments);});
  inviteCode.ensureIndex({code:1}, {unique:true}, function(){console.log(arguments);});
}
