$(function(){
		$("#changeNickName").blur(nickBlur).focus(nickFocus);
		$("#submitChangeInfo").click(submitChangeInfo);
});

nickBlur = function(){
	var name = $("#changeNickName").val()||'';
	var regName = /^([a-zA-Z0-9]|[._]){2,20}$/;
	if(!regName.exec(name)){
		return $("#nickNameWarn").html("昵称由2～20个字母或者数字或者._组成"); 
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/regist/checkName",
    dataType:"json",
    data:{name:name},
    error:function(){},
    success:function(data){
     	$("#nickNameWarn").html(data.warn); 
    }
	})
}

nickFocus = function(){
	$("#nickNameWarn").html("");
}


submitChangeInfo = function(){
	var changeNickName = $("#changeNickName").val();
	var changeRealName = $("#changeRealName").val();
	var changeTelNumber = $("#changeTelNumber").val();
	var changeMainPage = $("#changeMainPage").val();
	var regName = /^([a-zA-Z0-9]|[._]){2,20}$/;
	if(!regName.exec(changeNickName)){
    	sAlert("警告","请输入合法的昵称");
    	return false;
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/userCenter/changeInfo",
    dataType:"json",
    data:{changeNickName:changeNickName,
    changeRealName:changeRealName,
    changeTelNumber:changeTelNumber,
    changeMainPage:changeMainPage},
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

