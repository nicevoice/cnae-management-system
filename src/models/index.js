var mongo = require("mongoskin"),
    config = require("../config"),
    log = config.logWithFile,
    collectionNames = config.dbInfo.collections;
var db = exports.db = mongo.db(config.db_url),
     users = exports.users = db.collection(collectionNames.user),
     app_mem = exports.app_mem = db.collection(collectionNames.app_member),
     app_basic = exports.app_basic = db.collection(collectionNames.app_basic),
     records = exports.records = db.collection(collectionNames.app_record),
     inviteCode = exports.inviteCode = db.collection(collectionNames.inviteCode);
    collections = {};
//jscex
var Jscex = require('../lib/jscex/jscex-jit');
require('../lib/jscex/jscex-async').init(Jscex);
var standard = require('../lib/jscex/jscex-async-node').getJscexify(Jscex).fromStandard;

for(var name in collectionNames) {
  collections[collectionNames[name]] = db.collection(collectionNames[name]);
}
collections[collectionNames.user].ensureIndex({
  email : 1
}, {
  unique : true
}, function() {
});
collections[collectionNames.app_member].ensureIndex({
  appDomain : 1,
  email : 1
}, {
  unique : true
}, function() {
});
collections[collectionNames.app_basic].ensureIndex({
  appDomain : 1
}, {
  unique : true
}, function() {
});
collections[collectionNames.app_record].ensureIndex({
  appDomain : 1
},{
  unique : false
}, function() {
});

exports.addCollection = function(collectionName) {
  if(collections[collectionName])
    return;
  collections[collectionName] = db.collection(collectionName);
}
//执行操作
var _exec = function(arguments, method) {
  var collection = collections[arguments[0]], argv = arguments.length;
  if(!collection) {
    log.error("wrong collection name");
    return;
  }
  //保存查询参数
  var args = [];
  for(var i = 1; i < argv; ++i) {
    args.push(arguments[i]);
  }
  collection[method].apply(collection, args);
}

var _execAfterFind = function(arguments, method){
    var collection = collections[arguments[0]],
        argv = arguments.length,
        cb = arguments[argv-1];
    if(!collection){
        log.error("wrong collection name");
        return ;
    }
    if(typeof cb!='function'){
       log.error("last argument must be function");   
        return;
    }
    //保存查询参数
    var args = [];
    for(var i=1; i<argv-1; ++i){
        args.push(arguments[i]);
    }
    collection.find.apply(collection, args)[method](cb);    
}
exports.insert = function(){
    _exec(arguments, "insert");
}
exports.remove = function(){
    _exec(arguments, "remove");    
}

exports.find = function(){
    _execAfterFind(arguments, "toArray");
}

exports.count = function(){
    _exec(arguments, "count");
}

exports.findOne = function(){
    _exec(arguments, 'findOne');    
}

exports.update = function(){
    _exec(arguments, 'update');
}
exports.findAndModify = function(){
    _exec(arguments, 'findAndModify');
}
//jscex methods
var methods = ['insert', 'remove', 'update', 'find', 'findOne', 'findAndModify', 'count'];
for(var i=0, len=methods.length; i!=len; ++i){
  exports[methods[i]+'Jscex'] = standard(exports[methods[i]]);
}
