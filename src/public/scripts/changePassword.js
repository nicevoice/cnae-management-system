$(function(){
    $("#submitChangePassword").click(submitChangePassword);
});

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
	var regPass = /^(.*){6,}$/;
	if(!regPass.exec(changePassword)){
			sAlert("警告","密码不能少于6位");
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