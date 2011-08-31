$(function(){
	$("#newEmail").blur(emailBlur).focus(emailFocus);
	$("#newUserName").blur(nameBlur).focus(nameFocus);
	$("#newPassword").blur(passBlur).focus(passFocus);
	$("#passwordCon").blur(conBlur).focus(conFocus);
});

emailBlur = function(){
	var email = $("#newEmail").val()||'';
	var regEmail = /^[a-zA-Z0-9][a-zA-Z0-9_/.]+@(\w+).com$/;
	if(!regEmail.exec(email)){
		$("#emailWarn").html("请输入合法的email地址"); 
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
	var regName = /^([a-zA-Z0-9]|[._]){5,20}$/;
	if(!regName.exec(name)){
		$("#nameWarn").html("昵称由5～20个字母/数字组成"); 
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
	var regPass = /^([a-zA-Z0-9]){6,20}$/;
	if(!regPass.exec(password)){
		$("#passwordWarn").html("密码必须为6～20位字符和数字"); 
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
			$("#passwordWarn").html("两次密码必须一致"); 	
		}
}
conFocus = function(){
	$("#passwordWarn").html("");
}
