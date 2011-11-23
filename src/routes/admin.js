var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrAdmin = require('../controllers/admin');
    
module.exports = function(app){
  //邀请码模块
  if (!labs) {
      app.get("/admin", hasLogin, isAdmin, ctrAdmin.show);
  }
}
