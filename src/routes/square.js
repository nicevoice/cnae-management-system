var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    labs = require('../config').labs,
    webCache = require('../lib/webcache'),
    webcache = middleware.webcache,
    ctrSquare = require('../controllers/square');
module.exports = function(app){
  //应用广场
  if (!labs) {
    app.get("/square", hasLogin, ctrSquare.showSquare);
    app.get("/square/post", lasLogin, webcache(), ctrSquare.post);
//    app.get("/square/post1", webCache(), ctrSquare.post);
//    app.get("/square/post1", ctrSquare.post);
    app.post("/appSquare/apply", hasLogin, ctrSquare.apply);
    app.get(/^\/square\/([a-zA-Z0-9._\-]){2,20}$/, hasLogin, ctrSquare.showPersonalSquare);
    app.get("/square/post/personal", hasLogin, ctrSquare.personalSquare);
  }
}
