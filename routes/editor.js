var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    checkChangeAuth = middleware.checkChangeAuth,
    ctrEditor = require('../controllers/editor');

module.exports = function(app){
  // 编辑器
  app.get('/editor/:id', hasLogin, checkChangeAuth(2), ctrEditor.index);
  app.post('/editor/:id/filelist', hasLogin, checkChangeAuth(2), ctrEditor.listfile); // 文件列表
  app.post('/editor/:id/readfile', hasLogin, checkChangeAuth(2), ctrEditor.readfile); // 读文件
  app.post('/editor/:id/writefile', hasLogin, checkChangeAuth(2), ctrEditor.writefile); // 写文件
  app.post('/editor/:id/renamefile', hasLogin, checkChangeAuth(2), ctrEditor.renamefile); // 文件重命名
  app.post('/editor/:id/delfile', hasLogin, checkChangeAuth(2), ctrEditor.delfile); // 删除文件
  app.post('/editor/:id/mkdir', hasLogin, checkChangeAuth(2), ctrEditor.mkdir); // 创建目录
  app.post('/editor/:id/deldir', hasLogin, checkChangeAuth(2), ctrEditor.deldir); // 删除目录
  app.get('/editor/:id/querytool', hasLogin, checkChangeAuth(2), ctrEditor.querytool); // Query Tool
}