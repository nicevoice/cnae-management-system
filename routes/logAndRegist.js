var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    hasNotLogin = middleware.hasNotLogin,
    ctrLogin = require('../controllers/login'),
    ctrRegist = require('../controllers/regist'),
    ctrRetieve = require('../controllers/retieve');
    
module.exports = function(app){
  //login
  app.get('/login', ctrLogin.show);
  app.get('/checkLogin', ctrLogin.runLogin);
  app.get('/logout', hasLogin, ctrLogin.logout);
  //regist
  app.get("/regist", hasNotLogin, ctrRegist.regist);
  app.post("/checkRegist", hasNotLogin, ctrRegist.checkRegist);
  app.post("/regist/checkEmail", hasNotLogin, ctrRegist.checkEmail);
  app.post("/regist/checkName", ctrRegist.checkName);
  //retrieve
  app.get("/retrieve", hasNotLogin, ctrRetieve.showRetrieve);
  app.post("/retrieve", hasNotLogin, ctrRetieve.postRetrieve);
  app.get("/retrieveTips", hasNotLogin, ctrRetieve.showRetrieveTips);
  app.get("/resetPassword", hasNotLogin, ctrRetieve.showResetPassword);
  app.post("/resetPassword", hasNotLogin, ctrRetieve.resetPassword);
}
