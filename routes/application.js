var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    hasNotLogin = middleware.hasNotLogin,
    ctrApplication = require('../controllers/application');

module.exports = function(app){
  //我的应用模块
  app.get("/", hasLogin, ctrApplication.show);
  app.get("/application", hasLogin, ctrApplication.show);
  app.get("/application/newApp", hasLogin, ctrApplication.showNewApp);
  app.post("/getOwnAuth", hasLogin, ctrApplication.getOwnAuthInfo);
  app.post("/createApp", hasLogin, ctrApplication.createApp);
  app.post("/delete", hasLogin, ctrApplication.deleteApp);
  app.post("/join", hasLogin, ctrApplication.joinApp);
  app.post("/deleteCoop", hasLogin, ctrApplication.deleteCoop)
  app.post("/checkAppDomain", hasLogin, ctrApplication.checkAppDomain);
}
