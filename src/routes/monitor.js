var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrMonitor = require('../controllers/monitor');
    
module.exports = function(app){
  //邀请码模块
  if (!labs) {
      app.get("/monitor", hasLogin, isAdmin, ctrMonitor.show);
      app.get("/load_monitor", hasLogin, isAdmin, ctrMonitor.load);
  }
}
