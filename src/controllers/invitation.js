var config = require('../config')
  , log = config.logWithFile
  , model = require('../models/index')
  , find = model.find
  , findOne = model.findOne
  , update = model.update
  , insert = model.insert
  , remove = model.remove
  , count = model.count
  , inviteCode = config.dbInfo.collections.inviteCode
  , user = config.dbInfo.collections.user
  , sendMail = require('../lib/sendMail')
  , mails = sendMail.mails
  , mailEvent =sendMail.mailEvent
  , randomString = require('../lib/randomString').getRandomString
  , urlMoudle = require('url')
  , randomStringNum = require('../lib/randomString').getRandomStringNum
  , nodemailer = config.nodemailer;

/***
 * 显示生成邀请码页面
 * @param {} req
 * @param {} res
 */
exports.showInviteCode = function(req, res){
	res.render("inviteCode", {layout:"layoutMain", nickName:req.session.nickName, email:req.session.email})
}
exports.loadInviteCode = function(req ,res){
    var totalPage, pageNum = 10,
        url = req.url,
        page = parseInt(urlMoudle.parse(url, true).query.page||'1'),
        isAdmin = false,
        email = req.session.email;
    for(var i=0, len=config.admins.length; i<len; ++i){
        if(email === config.admins[i]){
            isAdmin = true;
            break;
        }
    }
    findOne(user, {email:req.session.email}, function(err, data){
        if(err){
            log.error(err.toString);
            return res.sendJson({
            status:"error",
            msg:"查询数据库错误"
            }); 
        }else{
            var count = data.inviteCode.length;
            totalPage = Math.ceil(count / pageNum);
            var showCodes = data.inviteCode.slice(pageNum*(page-1), pageNum*page);
            return res.sendJson({
                status:'ok',
                content:{
                    codes:showCodes,
                    pages:totalPage,
                    page:page,
                    admin:isAdmin
                }
            })
        }
    });
}
/***
 * 生成邀请码
 * @param {} req
 * @param {} res
 */
exports.generateInviteCode = function(req, res){
    var code = randomStringNum(11)
    update(user, {email:req.session.email}, {$push:{inviteCode:code}}, function(err){
        if(err){
            log.error(err.toString());
            return res.sendJson({
                status:'error',
                msg:'数据库操作失败'
            })
        }else{
            return res.sendJson({
                status:'ok',
                code:code
            })
        }
    })
}

/***
 * 给指定邮箱发送邀请码
 * @param {} req
 * @param {} res
 */
exports.sendInviteCode = function(req, res){
	var title = config.inviteMailTitle||'',
		content = config.inviteMailContent||'',
		email = req.body.email||'',
		code = req.body.code||'';
	var regEmail = config.regEmail;
	if(!regEmail.exec(email)){
		return res.sendJson( {done:false, warn:"请输入合法的email地址"}) 
	}
	var inviteNickName = email.split('@')[0];
	code+="&email="+email;
	var codeHtml = "<a href="+code+">"+code+"</a>";
	mails.push({
    sender: 'CNAE <heyiyu.deadhorse@gmail.com>',
    to : inviteNickName + " <"+email + ">",
    subject: title,
    html: content+codeHtml,
    debug: true
	});
	mailEvent.fire("getMail");
	return res.sendJson( {done:true});
}
/***
 * 删除邀请码
 * @param {} req
 * @param {} res
 */
exports.deleteInviteCode = function(req, res){
	var code = req.body.code||'';
	update(user, {inviteCode:code},
	    {$pull:{inviteCode:code}}, function(err){
		if(err){
      log.error(err.toString());
			return res.sendJson( {done:false});
		}else{
			return res.sendJson( {done:true});
		}
	})
}