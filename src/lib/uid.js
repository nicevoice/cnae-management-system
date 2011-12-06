var connectUtils = require('connect').utils,
    random = require('./utils').getRandomStringNum;
module.exports = function(){
  return function(req, res, next){
    if(req.cookies['uid']){
      console.log('already set');
      return next();
    }
    res.cookie('uid', random(20), {maxAge:200000000});
    next();
  }
}