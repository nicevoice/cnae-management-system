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
      ctrLogin = require('../controllers/labs/login');
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
    app.get("/regist/checkEmail", hasNotLogin, ctrRegist.checkEmail);
    app.get("/regist/checkName", ctrRegist.checkName);
    app.get("/registTips", hasNotLogin, ctrRegist.showRegistTips);
    app.get("/regist/activate", hasNotLogin, ctrRegist.activate);
    app.get("/regist/resend", hasNotLogin, ctrRegist.resend);
    //retrieve
    app.get("/retrieve", hasNotLogin, ctrRetrieve.showRetrieve);
    app.post("/retrieve", hasNotLogin, ctrRetrieve.postRetrieve);
    app.get("/retrieveTips", hasNotLogin, ctrRetrieve.showRetrieveTips);
    app.get("/resetPassword", hasNotLogin, ctrRetrieve.showResetPassword);
    app.post("/reset/password", hasNotLogin, ctrRetrieve.resetPassword);
  }
}
