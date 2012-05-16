var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrMonitor = require('../controllers/monitor');

module.exports = function(app) {
  if (!labs) {
    app.get("/monitor", hasLogin, isAdmin, ctrMonitor.show);
    app.get("/monitor/load", hasLogin, isAdmin, ctrMonitor.load);
    app.get("/monitor/apps", hasLogin, isAdmin, ctrMonitor.getList);
    app.get("/monitor/status", hasLogin, isAdmin, ctrMonitor.getStatus);
    app.get("/monitor/apps_detail", hasLogin, isAdmin, ctrMonitor.getDetailList);
    app.get("/monitor/app/:appname", hasLogin, isAdmin, ctrMonitor.getAppStatus);
    app.get("/monitor/app_log/:type/:appname/last/:line", hasLogin, isAdmin, ctrMonitor.getAppLog);
    app.post("/monitor/app/:appname/run", hasLogin, isAdmin, ctrMonitor.run);
    app.post("/monitor/app/:appname/stop", hasLogin, isAdmin, ctrMonitor.stop);
    app.post("/monitor/database", hasLogin, isAdmin, ctrMonitor.query);
    app.post("/monitor/blacklist/add", hasLogin, isAdmin, ctrMonitor.addBlack);
    app.post("/monitor/blacklist/del", hasLogin, isAdmin, ctrMonitor.delBlack);
  }
}