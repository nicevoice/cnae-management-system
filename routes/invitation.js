var middleware = require('./middleware'),
    hasLogin = middleware.hasLogin,
    ctrInvitation = require('../controllers/invitation');
    
module.exports = function(app){
  //邀请码模块
  app.get("/inviteCode", hasLogin, isAdmin, ctrInvitation.showInviteCode);
  app.post("/inviteCode", hasLogin, isAdmin, ctrInvitation.generateInviteCode);
  app.post("/sendInviteCode", hasLogin, isAdmin, ctrInvitation.sendInviteCode);
  app.post("/deleteInviteCode", hasLogin, isAdmin, ctrInvitation.deleteInviteCode);
}
