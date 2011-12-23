var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    checkAuth = middleware.checkAuth,
    checkChangeAuth = middleware.checkChangeAuth,
    switchs = require('../config').switchs,
    labs = switchs.labs,
    nonGit = switchs.nonGit,
    ctrAppInfo = require('../controllers/appInfo'),
    ctrAppDevelop = require('../controllers/appDevelop'),
    ctrAppManager = require('../controllers/appManager'),
    ctrAppOptimization = require('../controllers/appOptimization');

module.exports = function(app){
  //应用管理模块
  //显示
  app.get("/application/manage/:id", function(req, res, next){
    next();
  });
  //应用信息
  app.get("/application/manage/:id/sum", hasLogin, checkAuth, ctrAppInfo.sum);
  app.get("/application/manage/:id/load_sum", hasLogin, checkAuth, ctrAppInfo.loadSumContent);
  app.post("/application/manage/:id/controlApp", hasLogin, checkChangeAuth(2), ctrAppInfo.doControlApp);  //控制APP上下线
  app.post("/application/manage/:id/getStatus", hasLogin, checkAuth, ctrAppInfo.getStatus);  //获取应用状态信息
  //应用管理
  app.get("/application/manage/:id/appmng", hasLogin, checkAuth, ctrAppManager.appmng);
  app.get("/application/manage/:id/load_appmng", hasLogin, checkAuth, ctrAppManager.loadAppmng);
  if (!labs) {
    app.get("/application/manage/:id/coopmng", hasLogin, checkAuth, ctrAppManager.coopmng);
    app.get("/application/manage/:id/load_coopmng", hasLogin, checkAuth, ctrAppManager.loadCoopmng);
    app.get("/application/manage/:id/mnglog", hasLogin, checkAuth, ctrAppManager.mnglog);
    app.get("/application/manage/:id/load_mnglog", hasLogin, checkAuth, ctrAppManager.loadMnglog);
  }  
  app.post("/application/manage/:id/appmng", hasLogin, checkChangeAuth(1), ctrAppManager.doAppmng);  //修改应用信息
  if (!labs) {
    app.post("/application/manage/:id/coopmng", hasLogin, checkChangeAuth(0), ctrAppManager.doCoopmng); //发出邀请
    app.post("/application/mamage/:id/deleteCoop", hasLogin, checkAuth, checkChangeAuth(0), ctrAppManager.deleteCoop); //删除协作者
    app.post("/application/mamage/:id/agreeCoop", hasLogin, checkAuth, checkChangeAuth(0), ctrAppManager.agreeCoop); //同意协作请求
    app.post("/application/mamage/:id/refuseCoop", hasLogin, checkAuth, checkChangeAuth(0), ctrAppManager.refuseCoop); //拒绝协作请求
    app.post("/application/manage/:id/changeRole", hasLogin, checkChangeAuth(0), ctrAppManager.doChangeRole); //更改协作者权限
  }
  app.post("/application/manage/:id/addRecord", hasLogin, checkAuth, ctrAppManager.addRecord);  //添加应用管理记录
  //应用开发
  //code management
  app.get("/application/manage/:id/vermng", hasLogin, checkAuth, ctrAppDevelop.vermng);
  app.post("/application/manage/:id/git", hasLogin, checkChangeAuth(2), ctrAppDevelop.gitAction);  //git clone代码
  app.post("/application/manage/:id/upload", hasLogin, checkChangeAuth(2), ctrAppDevelop.doUpload);  //上传代码
  app.post("/application/manage/:id/download", hasLogin, checkChangeAuth(2), ctrAppDevelop.doDownload);  //代码打包下载
  app.get("/application/download/:id.zip", hasLogin, ctrAppDevelop.downloading);
  app.post("/application/manage/:id/npminstall", hasLogin, checkChangeAuth(2), ctrAppDevelop.npmInstall);  //npm install
  app.post("/application/manage/:id/uploadImg", hasLogin, checkChangeAuth(2), ctrAppDevelop.doUploadImg);  //上传接口
  //mongo
  app.get("/application/manage/:id/mongo", hasLogin, checkAuth, ctrAppDevelop.showMongo);
  app.get("/application/manage/:id/load_mongo", hasLogin, checkAuth, ctrAppDevelop.loadMongoContent);
  app.post("/application/manage/:id/createMongo", hasLogin, checkChangeAuth(2), ctrAppDevelop.createMongo);  //给应用分配mongoDB
  app.post("/application/manage/:id/queryMongo", hasLogin, checkChangeAuth(2), ctrAppDevelop.queryMongo);  //应用DB查询
  //todo
  app.get("/application/manage/:id/todo", hasLogin, checkAuth, ctrAppDevelop.showTodo);
  app.get("/application/manage/:id/load_todo", hasLogin, checkAuth, ctrAppDevelop.loadTodoContent);  
  app.post("/application/manage/:id/todo/new", hasLogin, checkChangeAuth(2), ctrAppDevelop.newTodo);  //添加todo
  app.post("/application/manage/:id/todo/finish", hasLogin, checkChangeAuth(2), ctrAppDevelop.finishTodo);  //完成、恢复、删除
  app.post("/application/manage/:id/todo/recover", hasLogin, checkChangeAuth(2), ctrAppDevelop.recoverTodo);
  app.post("/application/manage/:id/todo/delete", hasLogin, checkChangeAuth(2), ctrAppDevelop.deleteTodo);
   //package
  app.get("/application/manage/:id/package", hasLogin, checkAuth, ctrAppDevelop.showPackage);  
  app.get("/application/manage/:id/load_package", hasLogin, checkAuth, ctrAppDevelop.loadPackage);
 //应用调优
  app.get("/application/manage/:id/applog", hasLogin, checkAuth, ctrAppOptimization.applog);
  app.post("/application/manage/:id/getStdOutput", hasLogin, checkAuth, ctrAppOptimization.getStdOutput);  //获取标准输出/错误
  //
  app.get("/application/manage/:id/load_allapp", hasLogin, ctrAppManager.getAllApps);

}
