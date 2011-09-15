$(function(){
  if($("#commitRetrieve"))
    $("#commitRetrieve").click(checkEmail);
  if($("#back"))
    $("#back").click(back);
  if($("#commitReset"))
    $("#commitReset").click(checkPassword);
})

function checkEmail(){
  var email = $("#userEmail").val()||'';
  var regEmail = /^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/;
	if(!regEmail.exec(email)){
		sAlert("警告","请输入合法的email地址");
		return false;
	}
}
function back(){
  window.location = "/";
}
function checkPassword(){
  	var password = $("#changePassword").val()||'';
	  var regPass = /^(\w){6,20}$/;
  	if(!regPass.exec(password)){
		sAlert("警告","密码必须为6～20位字母、数字或下划线");
    return false;
	}else{
		var con = $("#changeConfirmation").val()||'';
		if(con && password!==con){
		sAlert("警告","两次密码必须一致");
		}
    return false;
	}
}
