var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    labs = require('../config').labs,
    webcache = require('../lib/webcache'),
    ctrSquare = require('../controllers/square');
module.exports = function(app){
  //应用广场
  if (!labs) {
    app.get("/square", hasLogin, ctrSquare.showSquare);
    app.get("/square/post", hasLogin, webcache(), ctrSquare.post);
    app.post("/appSquare/apply", hasLogin, ctrSquare.apply);
    app.get(/^\/square\/([a-zA-Z0-9._\-]){2,20}$/, hasLogin, ctrSquare.showPersonalSquare);
    app.get("/square/post/personal", hasLogin, ctrSquare.personalSquare);
  }
}
