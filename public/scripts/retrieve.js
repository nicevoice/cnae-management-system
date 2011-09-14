$(function(){
  $("#commitRetrieve").click(checkEmail);
  $("#close").click(closePage);
})

function checkEmail(){
  var email = $("#userEmail").val()||'';
  var regEmail = /^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/;
	if(!regEmail.exec(email)){
		sAlert("警告","请输入合法的email地址");
		return false;
	}
}
function closePage(){
  window.close();
}
