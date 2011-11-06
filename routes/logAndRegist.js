var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    hasNotLogin = middleware.hasNotLogin,
    ctrLogin = require('../controllers/login'),
    ctrRegist = require('../controllers/regist'),
    ctrRetrieve = require('../controllers/retrieve');
    
module.exports = function(app){
  //login
  app.get('/login', ctrLogin.show);
  app.post('/checkLogin', ctrLogin.checkLogin);
  app.get('/logout', hasLogin, ctrLogin.logout);
  //regist
  app.get("/regist", hasNotLogin, ctrRegist.regist);
  app.post("/checkRegist", hasNotLogin, ctrRegist.checkRegist);
  app.post("/regist/checkEmail", hasNotLogin, ctrRegist.checkEmail);
  app.post("/regist/checkName", ctrRegist.checkName);
  //retrieve
  app.get("/retrieve", hasNotLogin, ctrRetrieve.showRetrieve);
  app.post("/retrieve", hasNotLogin, ctrRetrieve.postRetrieve);
  app.get("/retrieveTips", hasNotLogin, ctrRetrieve.showRetrieveTips);
  app.get("/resetPassword", hasNotLogin, ctrRetrieve.showResetPassword);
  app.post("/resetPassword", hasNotLogin, ctrRetrieve.resetPassword);
}
