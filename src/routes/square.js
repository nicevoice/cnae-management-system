var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    labs = require('../config').labs,
    webCache = middleware.webCache,
    ctrSquare = require('../controllers/square');
module.exports = function(app){
  //应用广场
  if (!labs) {
    app.get("/square", hasLogin, ctrSquare.showSquare);
    app.get("/square/get/apps", hasLogin, webCache, ctrSquare.getSquareInfo);
    app.post("/appSquare/apply", hasLogin, ctrSquare.apply);
    app.get(/^\/square\/([a-zA-Z0-9._\-]){2,20}$/, hasLogin, ctrSquare.showPersonalSquare);
  }
}
