var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    labs = require('../config').labs,
    ctrUser = require('../controllers/user');
    
module.exports = function(app){
  //个人中心
  app.get("/userCenter", hasLogin, ctrUser.show);
  app.get("/userCenter/userInfo", hasLogin, ctrUser.userInfo);
  if (!labs) {
    app.get("/userCenter/changeInfo", hasLogin, ctrUser.changeInfo);
    app.get("/userCenter/changePassword", hasLogin, ctrUser.changePassword);
    app.post("/userCenter/changeInfo", hasLogin, ctrUser.doChangeInfo);
    app.post("/userCenter/changePassword", hasLogin, ctrUser.doChangePassword);
  }
}