var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrInvitation = require('../controllers/invitation');
    
module.exports = function(app){
  //邀请码模块
  if (!labs) {
    app.get("/inviteCode", hasLogin, isAdmin, ctrInvitation.showInviteCode);
    app.post("/inviteCode", hasLogin, isAdmin, ctrInvitation.generateInviteCode);
    app.post("/sendInviteCode", hasLogin, isAdmin, ctrInvitation.sendInviteCode);
    app.post("/deleteInviteCode", hasLogin, isAdmin, ctrInvitation.deleteInviteCode);
  }
}