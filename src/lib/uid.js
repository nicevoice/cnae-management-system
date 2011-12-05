var connectUtils = require('connect').utils;
var Cookie = require('../cookie');
module.exports = function(req, res, next){
  if(req.cookie.uid){
    next();
  }else{
    
  }  
}