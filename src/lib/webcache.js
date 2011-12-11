/**
 * Web cache base on redis
 * 
 */

var redis = require('redis');
var utils = require('connect').utils;
var config = require('../config');

/**
 * Default filter function. cache 'text/html'
 */

exports.filter = function(req, res) {
  var type = res.getHeader('Content-Type') || '';
   return type && type.match(/json|text|javascript/);
};

/**
 *  a simple cache in memory
 */
var Cache = function(flushTime){
  this.flushTime = flushTime||10000;
  this.cache = {};
  this._check = setInterval(this._checkCache, this.flushTime);
}
Cache.prototype.setex = function(key, time, value){
  this.cache[key] = {
    v:value,
    t:time
  }
}
Cache.prototype.get = function(key, cb){
  if(this.cache[key]&&this.cache[key].v){
    cb(null, this.cache[key].v);
  }else{
    cb(null, null);
  }
}
Cache.prototype.setFlushTime = function(flushTime){
  this.flushTime = flushTime||10000;
  clearInterval(this._check);
}
Cache.prototype._checkCache = function(){
  for(var key in this.cache){
    this.cache[key].t -= this.flushTime/1000;
    if(this.cache[key].t < 0){
      delete this.cache[key];
    }
  }
  setTimeout(this._checkCache, this.flushTime);
}
/**
 * Web cache middleware
 * @param options
 *     maxAge: cache ms, default is 1 minutes.
 *     cacheStore: where to store, default in simple cache
 *     filter:
 *     version:
 *     nocacheFilter: regex for nocache this path
 * @returns {Function}
 */
/*
 * 在http访问的时候，如果开启了缓存，这个url被访问过的话，再次访问就会先去redis找。
 * 通过修改res.write和res.end方法，在写数据的时候同时缓存到redis。只要在这段时间有人
 * 访问过这个页面，则直接调缓存，不去后台获取数据。
 */
module.exports = function webcache(options) {
  options = options || {};
  options.maxAge = (options.maxAge || 60000) / 1000;
  options.filter = options.filter || exports.filter;
  options.version = options.version || '';
  var nocacheFilter = options.nocacheFilter || null;
  var cache = options.cacheStore||new Cache();
  return function(req, res, next) {
    if(nocacheFilter && nocacheFilter.test(req.url)) {
      return next();
    }
    var key = req.url + options.version;
    cache.get(key, function(err, hit) {
      var uacc = utils.parseCacheControl(req.headers['cache-control'] || '');
      // 判断请求是否要求不走cache
      if(!uacc['no-cache'] && typeof hit === 'string') {
//      console.log(req.url, 'hit cache')
//      res.setHeader('Cache-Control', 'public, max-age=' + options.maxAge);
        return res.end(hit);
      }
      res.on('header', function() {
        if(!options.filter(req, res)) {
          return;
        }
              
        // check if no-cache
        var cc = utils.parseCacheControl(res.getHeader('cache-control') || '');
//      console.log(res._headers, cc, res.statusCode, res.getHeader('cache-control'));
        if(cc['no-cache'] || res.statusCode !== 200) {
          return;
        }
        var maxAge = 'max-age' in cc ? cc['max-age'] : options.maxAge;
//      res.setHeader('Cache-Control', 'public, max-age=' + maxAge);

        var chunks = '';
        res.__write__ = res.write;
        res.write = function(chunk, encoding) {
          res.__write__(chunk, encoding);
          if(Buffer.isBuffer(chunk)) {
            chunks += chunk.toString(encoding);
          } else {
            chunks += (chunk || '');
          }
        };
        var end = res.end;
        res.end = function(chunk, encoding) {
          res.end = end;
          if(chunk) {
            res.write(chunk, encoding);
          }
          res.end();
          cache.setex(key, maxAge, chunks);
//          console.log('cache', req.url, res._headers, chunks.length)
        };
      });
      next();
    });
  };
};


