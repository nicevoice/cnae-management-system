var connectUtils = require('connect').utils;

module.exports = function(){
  return function(req, res, next){
    res.cookie = cookie;
    next();
  }
}

/**
 * Set cookie `name` to `val`, with the given `options`.
 *
 * Options:
 *
 *    - `maxAge`   max-age in milliseconds, converted to `expires`
 *    - `path`     defaults to "/"
 *
 * Examples:
 *
 *    // "Remember Me" for 15 minutes
 *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
 *
 *    // save as above
 *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
 *
 * @param {String} name
 * @param {String|Object} val
 * @param {Options} options
 * @api public
 */

function cookie (name, value, options){
  options = options||{};
  if('object' === typeof value){    //if value is jsoan
    value = 'j:' + JSON.stringify(value);
  }
  if('maxAge' in options){          //set maxAge
    options.expires = new Date(Date.now() + options.maxAge);
  }
  if('undefined' === typeof options.path){ //if no path
    options.path = '/';
  }
  var cookie = utils.serializeCookie(name, value, options);
  this.setHeader('set-cookie', cookie);
}
