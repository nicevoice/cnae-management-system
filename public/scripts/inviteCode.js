$(function(){
	$("#generateInviteCode").click(generate);
	$("#sendInviteCode").click(sendInvite);
})

function generate(){
	$.ajax({
	cache:false,
	type:"post",
	url:"/inviteCode",
    dataType:"json",
    data:{},
	error:function(){
		sAlert("警告","ajax错误，请稍后再试");
	},
	success:function(data){
		if(data.done===false){
			sAlert("警告","生成错误，请稍后再试");
		}else{
		$("#inviteCode").html(data.code);
		}
	}
	});
}

function sendInvite(){
	var code = $("#inviteCode").html(),
		email  =$("#email").val()||'';
	if(code==="请点击生成按钮"){
		return sAlert("警告","请先生成邀请码！");
	}
	var regEmail = /^[a-zA-Z0-9](\w+)@(\w+).com$/;
	if(!regEmail.exec(email)){
		return sAlert("警告","请输入合法的email地址"); 
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/sendInviteCode",
    dataType:"json",
    data:{email:email,code:code},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
      	sAlert("","邀请码已发送");
      }
   	}
});	
}