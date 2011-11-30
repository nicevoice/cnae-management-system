var log = require('../config').logWithFile
  , getLog = require('../lib/utils').getLog
    //model
  , find = require('../models/index').find
  , app_mem = require('../config').dbInfo.collections.app_member;
  
exports.applog = function(req, res) {
  var url = req.url;
  url = url.slice(0, url.lastIndexOf('/'));
    return res.render("appManageLog", {
      layout : "layoutApp",
      url : url,
      nickName : req.session.nickName,
      email : req.session.email
    });
};
exports.getStdOutput = function(req, res) {
  var domain = req.params.id || '', action = req.body.action;
  getLog(action, domain, 1000, function(data) {
    try {
      return res.sendJson({
        output : data
      });
    } catch(e) {
    };
  });
}
