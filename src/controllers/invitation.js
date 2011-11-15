var config = require('../config')
  , log = config.logWithFile
  , model = require('../models/index')
  , find = model.find
  , insert = model.insert
  , remove = model.remove
  , count = model.count
  , inviteCode = config.dbInfo.collections.inviteCode
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
	res.render("inviteCode", {layout:"layoutMain", nickName:req.session.nickName, email:req.session.email})
}

exports.loadInviteCode = function(req, res) {
  var totalPage, pageNum = 10;
  var url = req.url;
  var page = urlMoudle.parse(url, true).query.page || '1';
  count(inviteCode, {}, function(err, count) {
    if(err) {
      log.error(err.toString());
      return res.sendJson({
        status:"error",
        msg:"查询数据库错误"
      });
    } else {
      totalPage = Math.ceil(count / pageNum);
      find(inviteCode, {}, {
        skip : pageNum * (page - 1),
        limit : pageNum
      }, function(err, data) {
        if(err) {
          log.error(err.toString());
          return res.sendJson({
            status:"error",
            msg:"查询数据库错误"
          })
        }
        res.sendJson({
          status : "ok",
          content : {
            codes : data,
            pages : totalPage,
            page : page
          }
        });
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
	find(inviteCode, {},{id:1}, function(err, data){
		if(err){
			log.error(err.toString());
			return res.sendJson( {done:false});
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
		insert(inviteCode, {id:num, code:code},function(){
			if(err){
			log.error(err.toString());
			return res.sendJson( {done:false});
			}else{
				//return res.sendJson( {done:true, code:code});	
			  return res.sendJson({done:true, code:code});
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
	remove(inviteCode, {code:code},function(err){
		if(err){
      log.error(err.toString());
			return res.sendJson( {done:false});
		}else{
			return res.sendJson( {done:true});
		}
	})
}