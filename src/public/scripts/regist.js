$(function(){
	$("#newEmail").blur(emailBlur).focus(emailFocus);
	$("#newUserName").blur(nameBlur).focus(nameFocus);
	$("#newPassword").blur(passBlur).focus(passFocus);
	$("#passwordCon").blur(conBlur).focus(conFocus);
});
emailBlur = function(){
	var email = $("#newEmail").val()||'';
	var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	if(!regEmail.exec(email)){
		$("#emailWarn").html("请输入合法的email地址"); 
		return false;
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/regist/checkEmail",
    dataType:"json",
    data:{email:email},
    error:function(){},
    success:function(data){
     $("#emailWarn").html(data.warn); 
    }
	});
}
emailFocus = function(){
	$("#emailWarn").html("");
}

nameBlur = function(){
	var name = $("#newUserName").val()||'';
	var regName = /^([a-zA-Z0-9._\-]){1,20}$/;
	if(!name){
        $("#nameWarn").html("必须输入昵称"); 
        return false;	    
	}
	if(!regName.exec(name)){
		$("#nameWarn").html("昵称中不能包含特殊字符"); 
		return false;
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/regist/checkName",
    dataType:"json",
    data:{name:name},
    error:function(){},
    success:function(data){
     $("#nameWarn").html(data.warn); 
    }
	});
}
nameFocus = function(){
	$("#nameWarn").html("");
}


passBlur = function(){
	var password = $("#newPassword").val()||'';
	var regPass = /^[a-zA-Z0-9_\!\@\#\$\%\^\&\*\(\)]{6,}$/
	if(!regPass.exec(password)){
		$("#passwordWarn").html("密码不能小于6位"); 
		return false;
	}else{
		var con = $("#passwordCon").val()||'';
		if(con && password!==con){
			$("#passwordWarn").html("两次密码必须一致"); 	
		}
	}
}
passFocus = function(){
	$("#passwordWarn").html("");
}

conBlur = function(){
	var password = $("#newPassword").val()||'';
	var con = $("#passwordCon").val()||'';
	if(password!==con){
			$("#conWarn").html("两次密码必须一致"); 	
		}
}
conFocus = function(){
	$("#conWarn").html("");
}
