var index = require('./index');
//remove("user", cb);
//update("user", {a:1}, {a:2}, cb);
//cb(new Error(123));
function cb (err, data){
    if(err){
        console.log(err.toString());
    }
    if(data){
        console.log(data);
    }
}
//index.insert("user", {a:1, b:1});
//index.remove("user", {b:1});
//index.find("user",{a:2},{limit:10},cb);

//index.update("user", {a:1}, {a:2}, cb);
//index.insert("user", [{a:2}, {a:2}]);
//index.count("user",{a:2}, cb);
//index.find("user", cb);
var name = "unit_test_collection";
index.addCollection(name);
index.update(name, {a:1}, {$set:{a:2, b:2, c:3}}, {multi:true}, cb);
//index.insert(name, { c:3}, cb);
//index.update("user", {a:1, b:2}, {a:2, b:2}, {multi:true}, cb);
//index.db.collection("user").update({a:1, b:2}, {multi:true}, cb);
index.find(name, {}, cb);
