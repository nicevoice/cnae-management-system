var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    hasNotLogin = middleware.hasNotLogin,
    labs = require('../config').labs,
    ctrApplication = require('../controllers/application');

module.exports = function(app){
  //我的应用模块
  if(!labs){
      app.get("/", hasNotLogin, ctrApplication.showMainPage);
  }else{
      app.get("/", hasLogin, ctrApplication.show);
  }
  app.get("/application", hasLogin, ctrApplication.show);
  app.get("/application/load_apps", hasLogin, ctrApplication.loadMainContent);
  app.get("/getOwnAuthInfo", hasLogin, ctrApplication.getOwnAuthInfo);
  if (!labs) {
    app.get("/application/newApp", hasLogin, ctrApplication.showNewApp);
    app.post("/createApp", hasLogin, ctrApplication.createApp);
    app.post("/delete", hasLogin, ctrApplication.deleteApp);
    app.post("/join", hasLogin, ctrApplication.joinApp);
    app.post("/deleteCoop", hasLogin, ctrApplication.deleteCoop)
    app.get("/checkAppDomain", hasLogin, ctrApplication.checkAppDomain);
  }
}
