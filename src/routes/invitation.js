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
    app.post("/inviteCode/gen", hasLogin, isAdmin, ctrInvitation.generateInviteCode);
    app.get("/inviteCode/send", hasLogin, ctrInvitation.sendInviteCode);
    app.post("/inviteCode/del", hasLogin, ctrInvitation.deleteInviteCode);
  }
}
