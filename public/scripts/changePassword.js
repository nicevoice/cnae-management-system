$(function(){
		$("#changePassword").blur(passBlur).focus(passFocus);
		$("#changeConfirmation").blur(conBlur).focus(conFocus);
		$("#submitChangePassword").click(submitChangePassword);
});

passBlur = function(){
	var password = $("#changePassword").val()||'';
	var regPass = /^([a-zA-Z0-9]){6,20}$/;
	if(!regPass.exec(password)){
		$("#passwordWarn").html("密码必须为6～20位字符和数字"); 
	}else{
		var con = $("#changeConfirmation").val()||'';
		if(con && password!==con){
			$("#passwordWarn").html("两次密码必须一致"); 	
		}
	}
}
passFocus = function(){
	$("#passwordWarn").html("");
}

conBlur = function(){
	var password = $("#changePassword").val()||'';
	var con = $("#changeConfirmation").val()||'';
	if(password!==con){
			$("#passwordWarn").html("两次密码必须一致"); 	
		}
}
conFocus = function(){
	$("#passwordWarn").html("");
}
submit = function(e){ 
    var ev = document.all ? window.event : e;
    if(ev.keyCode==13) {
    	submitChangePassword();
    }
}
submitChangePassword = function(){
	var oldPassword= $("#oldPassword").val();
	var changePassword = $("#changePassword").val();
	var changeConfirmation = $("#changeConfirmation").val();
	var regPass = /^([a-zA-Z0-9]){6,20}$/;
	if(!regPass.exec(changePassword)){
			sAlert("警告","密码必须为6～20位字符或者数字");
			return false;
	}
	if(changePassword!==changeConfirmation){ 
		sAlert("警告","两次密码必须一致"); 		
		return false;
	} 	
	$.ajax({
    cache:false,
    type:"POST",
    url:"/userCenter/changePassword",
    dataType:"json",
    data:{
    oldPassword:oldPassword,
    changePassword:changePassword,
    changeConfirmation:changeConfirmation
    },
    error:function(){
    	sAlert("警告","连接错误，请稍后再试");
    	},
    success:function(data){
    	if(data.done){
    		sAlert("","修改成功");
    	}else{
    		sAlert("警告",data.message);
    	}
    }
	});
	return false;
}