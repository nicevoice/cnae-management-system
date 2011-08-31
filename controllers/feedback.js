var config = require('../config'),
	sendMail = require('../controllers/sendMail'),
	mails = sendMail.mails,
	mailEvent =sendMail.mailEvent,
	nodemailer = config.nodemailer,	
	admin = config.admin,
	resAjax = config.resAjax;
/***
 * 显示反馈页面
 * @param {} req
 * @param {} res
 */
exports.show = function(req, res){
	res.render("feedBack",{nickName:req.session.nickName, email:req.session.email});	
}
/***
 * 处理反馈提交
 * @param {} req
 * @param {} res
 */
exports.postFeed = function(req, res){
	var title = req.body.title||'';
	var content = req.body.content||'';
	
	mails.push({
    sender: 'NAE CNAEMail@gmail.com',
    to : "admin <"+admin+">",
    subject: title,
    html: content+"<br \>post by:"+req.session.email,
    debug: true
	});
	mailEvent.fire("getMail");
	return resAjax(res, {done:true});
}
