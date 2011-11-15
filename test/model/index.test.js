var model = require('../../src/models/index'),
    EventProxy = require('EventProxy.js').EventProxy,
    testCase = require('nodeunit').testCase,
    find = model.find,
    findOne = model.findOne,
    findAndModify = model.findAndModify,
    insert = model.insert,
    remove = model.remove,
    update = model.update,
    count = model.count;
var name = "unit_test_collection";
model.addCollection(name);
var collection = model.db.collection(name);

remove(name, function(err) {
    });
module.exports = testCase({
  setUp : function(callback) {
    callback();
  },
  tearDown : function(callback) {
    callback();
  },
  test_insert_one : function(test) {
    var cb = function(err, docs){
      collection.find({a:2, b:3}).toArray(function(err, result){
        test.deepEqual({length: result.length, a:result[0].a, b:result[0].b}, {length:1, a:2, b:3}, "insert one error");
        test.deepEqual(result, docs, "insert one return error");
        test.done();
      })
    }
    insert(name, {
      a : 2,
      b : 3
    }, cb);
  },
  
  test_update_one : function(test){
    var cb = function(err){
      collection.find().toArray(function(err, result){
        test.deepEqual({a:result[0].a, b:result[0].b}, {a:3, b:4}, "update one error");
        test.done();
    })
    };
    update(name, {a:2, b:3}, {$set:{a:3, b:4}}, cb);
  },
  
  test_remove_one : function(test){
    var cb = function(err){
      collection.find({}).toArray(function(err, data){
        test.deepEqual(data, [], "remove one error");
        test.done();
      })
    }
    remove(name, {a:3, b:4}, cb);
  },
  test_insert_multi: function(test){
    var cb = function(err, docs){
      collection.find({}).toArray(function(err, result){
        test.deepEqual(result, docs, "insert many return error");
        test.done();
      })  
    };
    insert(name, [{a:2, b:3}, {a:2, b:4}, {a:3, b:5}], cb);
  },
  
  test_update_multi : function(test){
    var cb = function(err){
      collection.find({a:1, b:2, c:3}).toArray(function(err, result){
        test.deepEqual(result.length, 2, "update multi error");
        test.done();
      })
    };
    update(name, {a:2}, {$set:{a:1, b:2, c:3}}, {multi:true}, cb);
  },
  test_count : function(test){
    var cb = function(err, count){
      test.deepEqual(count, 2, "count error");
      test.done();
    };
    count(name, {a:1, b:2, c:3}, cb);
  },
  
  test_find : function(test){
    var done = new EventProxy();
    done.assign("find_1","find_2", "find_3", "find_4", function(){
      test.done();
    })
    find(name, {a:1, b:2, c:3}, function(err, result_1){
      collection.find({a:1, b:2, c:3}).toArray(function(err, result_2){
        test.deepEqual(result_1, result_2, 'find only selector error');
        done.fire('find_1');
      })
    });
    find(name, {a:1, b:2, c:3}, {a:1, b:1}, function(err, result_1){
      collection.find({a:1, b:2, c:3}, {a:1, b:1}).toArray(function(err, result_2){
        test.deepEqual(result_1, result_2, 'find selector&fields error');
        done.fire('find_2');
      })
    });
    find(name, {a:{$lt:2}, b:2, c:3}, {limit:1}, function(err, result_1){
      collection.find({a:{$lt:2}, b:2, c:3}, {limit:1}).toArray(function(err, result_2){
        test.deepEqual(result_1, result_2, 'find selector&option error');
        done.fire('find_3');
      })
    });    
    find(name, {a:{$lt:2}, b:2, c:3}, {a:1, b:1}, {limit:1}, function(err, result_1){
      collection.find({a:{$lt:2}, b:2, c:3}, {a:1, b:1}, {limit:1}).toArray(function(err, result_2){
        test.deepEqual(result_1, result_2, 'find selector&option error');
        done.fire('find_4');
      })
    });
  },
  
  test_findOne : function(test){
    findOne(name, {a:{$lt:2}, b:2, c:3}, function(err, doc){
      test.deepEqual({a:doc.a, b:doc.b, c:doc.c}, {a:1, b:2, c:3}, "findOne error");
      test.done();
    })
  },
  
  test_findAndModify : function(test){
    findAndModify(name, {a:1, b:2, c:3}, [['a', 'ascending']], {$set:{d:4}}, function(err, doc){
      test.deepEqual({a:doc.a, b:doc.b, c:doc.c}, {a:1, b:2, c:3}, 'findAndModify return error');
      count(name, {d:4}, function(err, count){
        test.deepEqual(count, 1, 'findAndModify error');
        test.done();
      })
    })
  }  
})
