var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    hasNotLogin = middleware.hasNotLogin,
    runLogin = middleware.runLogin,
    ctrRegist = require('../controllers/regist'),
    ctrRetrieve = require('../controllers/retrieve'),
    labs = require('../config').labs,
    ctrLogin;
    if(!labs){
      ctrLogin = require('../controllers/login');
    }else{
      ctrLogin = require('../labs/controllers/login');
    }
module.exports = function(app){
  //login
  app.get('/login', ctrLogin.show);
  if (!labs) {
    app.post('/checkLogin', ctrLogin.checkLogin);
  }else{
    app.get('/checkLogin', ctrLogin.checkLogin);
  }
  app.get('/logout', hasLogin, ctrLogin.logout);
  if (!labs) {
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
}
