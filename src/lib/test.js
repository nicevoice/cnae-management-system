var rmrf = require('./rmrf');
var merge = require('./merge');
var exec = require('child_process').exec;
var fs = require('fs');
var begin = Date.now();
var src ='test', des = 'test1';
merge(src, des, function(err){
  if(err){
    console.log(err.toString());
  }
  var m = Date.now();
  console.log('merge', m-begin);
  rmrf(des, function(err){
    if(err){
      console.log(err.toString());
    }
    var rm = Date.now();
    console.log('rmrf', rm - m);
  fs.mkdirSync('test1');
    rm = Date.now();
    exec('cp -af test/* test/.[^.]* test1', function(){
       var cp = Date.now();
       console.log('copy', cp - rm);
       exec('rm -rf test1', function(){
         console.log("rm -rf", Date.now() - cp); 
      })
     })
  })
})
