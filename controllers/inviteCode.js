var config = require('../config')
  , log = config.logWithFile
  , db = config.db
  , inviteCode = db.collection(config.db_inviteCode)
  , sendMail = require('../lib/sendMail')
  , mails = sendMail.mails
  , mailEvent =sendMail.mailEvent
  , randomString = require('../lib/randomString').getRandomString
  , urlMoudle = require('url')
  , nodemailer = config.nodemailer;

/***
 * 显示生成邀请码页面
 * @param {} req
 * @param {} res
 */
exports.showInviteCode = function(req, res){
	var totalPage, pageNum = 10;
	var url = req.url;
	var page = urlMoudle.parse(url, true).query.page||'1';
	inviteCode.find({},{code:1}).count(function(err, count){
		if(err){
			log.error(err);
			res.render("error", {message:"查询数目错误"});
		}else{
			totalPage = Math.ceil(count/pageNum);
			inviteCode.find({},{skip:pageNum*(page-1), limit:pageNum}
			).toArray(function(err, data){
			if(err){
				log.error(err);
				res.render("error", {message:"数据库查询错误"});
			}
			res.render("inviteCode", {layout:"layoutMain", nickName:req.session.nickName||'',
			codes:data, pages:totalPage, page:page, email:req.session.email});
			});
		}
	});
}
/***
 * 生成邀请码
 * @param {} req
 * @param {} res
 */
exports.generateInviteCode = function(req, res){
	var num=1;
	console.log(123);
	inviteCode.find({},{id:1}).toArray(function(err, data){
		if(err){
			log.error(err);
			return resAjax(res, {done:false});
		}
		if(!data||data.length<1){
			num=1;
		}else{
			var max=0;
			for(var i=0, len=data.length; i<len; ++i){
				if(data[i].id>max){
				max = data[i].id;	
				}
			}
			num = max+1;
		}
		var code = num.toString()+randomString(10);
		console.log(code);
		inviteCode.save({id:num, code:code},function(){
			if(err){
			log.error(err);
			return resAjax(res, {done:false});
			}else{
				return resAjax(res, {done:true, code:code});	
			}
		})
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
	var regEmail = /^[a-zA-Z0-9_/./-]+@(\w+).(\w){2,4}$/;
	if(!regEmail.exec(email)){
		return resAjax(res, {done:false, warn:"请输入合法的email地址"}) 
	}
	code+="&email="+email;
	var codeHtml = "<a href="+code+">"+code+"</a>";
	mails.push({
    sender: 'NAE CNAEMail@gmail.com',
    to : email,
    subject: title,
    html: content+codeHtml,
    debug: true,
    headers: {
    	"Content-Type":"text/html"
        }
	});
	mailEvent.fire("getMail");
	return resAjax(res, {done:true});
}
/***
 * 删除邀请码
 * @param {} req
 * @param {} res
 */
exports.deleteInviteCode = function(req, res){
	var code = req.body.code||'';
	inviteCode.remove({code:code},function(err){
		if(err){
			return resAjax(res, {done:false});
		}else{
			return resAjax(res, {done:true});
		}
	})
}