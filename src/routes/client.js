var middleware = require('./middleware'),
    connect = require('connect'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrClient= require('../controllers/client');

module.exports = function(app){
  if(!labs){
    app.post("/client/upload", hasLogin, isAdmin, ctrClient.upload);
    app.get(/\/client\/.*/, connect.static(require('path').dirname(__dirname)));
  }
}