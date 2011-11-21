var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    isAdmin = middleware.isAdmin,
    labs = require('../config').labs,
    ctrInvitation = require('../controllers/invitation');
    
module.exports = function(app){
  //邀请码模块
  if (!labs) {
    app.get("/inviteCode", hasLogin, ctrInvitation.showInviteCode);
    app.get("/load_inviteCode", hasLogin, ctrInvitation.loadInviteCode)
    app.post("/inviteCode", hasLogin, isAdmin, ctrInvitation.generateInviteCode);
    app.post("/sendInviteCode", hasLogin, ctrInvitation.sendInviteCode);
    app.post("/deleteInviteCode", hasLogin, ctrInvitation.deleteInviteCode);
  }
}
