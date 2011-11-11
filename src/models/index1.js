var mongoDb = require("mongodb").Db,
    Server = require("mongodb").Server
    dbInfo = require("../config").dbInfo,
    collections = dbInfo.collections;
    db = exports.db = new mongoDb(dbInfo.name, new Server(dbInfo.host, dbInfo.port),{});
//    users = exports.users = db.collection(collections.user),
//    app_mem = exports.app_mem = db.collection(collections.app_member),
//    app_basic = exports.app_basic = db.collection(collections.app_basic),
//    records = exports.records = db.collection(collections.app_record),
//    inviteCode = exports.inviteCode = db.collection(collections.inviteCode);
    
//exports.ensureIndexes = function(){
//  users.ensureIndex({email:1, nickName:1}, {unique:true}, function(){console.log(arguments);});
//  app_mem.ensureIndex({appDomain:1, email:1}, {unique:true}, function(){console.log(arguments);});
//  app_basic.ensureIndex({appDomain:1}, {unique:true}, function(){console.log(arguments);});
//  records.ensureIndex({appDomain:1}, {unique:true}, function(){console.log(arguments);});
//  inviteCode.ensureIndex({code:1}, {unique:true}, function(){console.log(arguments);});
//}
function checkCollection(name, cb){
  if(typeof name!=='string'){
   return 'collectionName must be string';
  }
  else{
    var rightName = false;
    for(var collection in collections){
      if(name === collection){
        rightName = true; break;
      }
    }
    if (!rightName){
      return 'wrong collectionName';
    }
    return true;
  }
  
}

exports.test = function(){
    db.open(function(err,db){
        db.collection("user", function(err, collection){
            collection.insert({'a':2}, function(docs){
                //collection.remove({'a':2}, function(err,data){
                collection.remove.call(collection, {'a':2}, function(err, data){
                    (function(err, data){
                        console.log(data);
                    })(err, data);
                    db.close();
                })
            })
        })
    });
}
exports.find = function(){
  var args=[],
  	  argv = arguments.length;
  for(var i=0; i!=argv; ++i){
      args.push(arguments[i]);
  }
  var cb = args[argv-1],
      collectionName = args[0];
  if(typeof cb!=='function'){
    throw(new Error("last argment must be function"));
    return;
  }
  var check = checkCollection(collectionName);
  if(check!==true){
    return cb(new Error(check));
  }
  db.open(function(err, db){
      if(err){
          console.log("find err");
          cb(err);
      }else{
        var realCb = function(err, data){
            cb(err, data);
            db.close();
        }
        db.collection(collectionName, function(err, collection){
            if(err){
                return realCb(err);
            }
            var queryArgs = args.splice(1, argv-2);
            collection.find.apply(collection, queryArgs).toArray(realCb);
        })
    }

  })
}

exports.remove = function(){
    var args = [],
        argv = arguments.length;
    for(var i=0; i!=argv; ++i){
        args.push(arguments[i]);
    }
    var cb = args[argv-1],
        collectionName = args[0];
    if(typeof cb !== 'function'){
        throw(new Error("last argment must be function"));       
        return;
    }
    var check = checkCollection(collectionName);
    if(!check){
        cb(new Error(check));
    }
    db.open(function(err, db){
        if(err){
            return cb(err);
        }else{
            var realCb = function(err, result){
                cb(err, result);
                db.close();
            }
            db.collection(collectionName, function(err, collection){
                args[argv-1] = realCb;
                var argsQuery = args.splice(1, argv-1);
                collection.remove.apply(collection, argsQuery);
            })
        }        
    })
}
exports.insert = function(){
    var args = [],
        argv = arguments.length;
    for(var i=0; i!=argv; ++i){
        args.push(arguments[i]);
    }
    var cb = args[argv-1],
        collectionName = args[0];
    if(typeof cb !== 'function'){
        throw(new Error("last argment must be function"));       
        return;
    }
    var check = checkCollection(collectionName);
    if(!check){
        cb(new Error(check));
    }
    db.open(function(err, db){
        if(err){
            console.log(err);
            return cb(err);
        }else{
            var realCb = function(err, result){
                cb(err, result);
                db.close();
            }
            db.collection(collectionName, function(err, collection){
                if(err){
                    console.log("err");
                    realCb(err);
                }
                args[argv-1] = realCb;
                var argsQuery = args.splice(1, argv-1);
                collection.insert.apply(collection, argsQuery);
            })
        }        
    })
}

exports.update = function(){
    var args = arguments,
        argv = arguments.length,
        cb = args[argv-1],
        collectionName = args[0];
    if(typeof cb !== 'function'){
        return;
    }
    var check = checkCollection(collectionName);
    if(!check){
        cb(new Error(check));
    }
    db.open(collectionName, function(err, collection){
        if(err){
            return cb(err);
        }
        switch(argv){
            case 2:collection.update(cb);break;
            case 3:collection.update(args[1], cb); break;
            case 4:collection.update(args[1], args[2], cb); break;
            case 5:collection.update(args[1], args[2], args[3], cb); break;
            default: cb(new Error("wrong number of args"));
        }
    })
}
