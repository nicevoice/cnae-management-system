var Jscex = require('./jscex-jit');
require('./jscex-async').init(Jscex);
var fs = require('fs');
var path = require('path');
var jscexify = require('./jscex-async-node').getJscexify(Jscex);
var http = require('http');
var exec = require('child_process').exec;
path.existsAsync = jscexify.fromCallback(path.exists);
fs.readFileAsync = jscexify.fromStandard(fs.readFile);
var execAsync = jscexify.fromStandard(exec);
var mkdirWrap = function(path, cb){
  fs.mkdir(path, function(err){
    if(err&&err.code!=='EEXIST'){
      cb(err);
    }else{
      cb(null);
    }
  })
}
var mkdirAsync = jscexify.fromStandard(fs.mkdir);

function Type(obj){
  return typeof(obj);
}
var ignore = function(fn){
  return function(){
    var args=[];
    for(var i=0, len=arguments.length; i!=len; ++i){
      args.push(arguments[i]);
    }
    var cb = args[len-1];
    if(typeof cb === 'function'){
      args[len-1] = function(){
        var args=[null];
        for(var i=1, len=arguments.length; i!=len; ++i){
          args.push(arguments[i]);
        }
        cb.apply(cb, args);
      }
    }
    fn.apply(fn, args);
  }
}

function two(cb){
  cb(new Error('error'), 1, 2);
}
ignore(two)(function(err, a, b){console.log(err)});
var async = eval(Jscex.compile("async", function(){
    console.log('begin');
    $await(mkdirAsync("dir"));
    console.log(123);
    $await(mkdirAsync("dir/dir"));
}));
async().start();

