$(function(){
	$("#submitAppInfo").click(submitNewAppInfo);
	$.ajax({
		cache:false,
		url:"/getOwnAuthInfo",
		type:"post",
		dataType:"json",
		data:{domain:$("#appDomain").html()},
		error:function(){},
		success:function(data){
			if(data.active===0 || data.role>1){//如果不是创建者和管理员
				$("#submitAppInfo").attr("disabled","true");
			}
		}
	});
});

//修改应用信息
function submitNewAppInfo(){
	var newAppName = $("#newAppName").val();
	var newAppDes = $("#newAppDes").val();
	var url = $("form").attr('action');
	$.ajax({
    cache:false,
    type:"POST",
    url:url,
    dataType:"json",
    data:{newAppName:newAppName, newAppDes:newAppDes},
    error:function(){
      sAlert("警告","没有权限进行此操作");
    },
    success:function(data){
      if(data.done===false)
        sAlert("警告","没有权限进行此操作");
      else{
      	sAlert("","修改成功！");
      	}
   	}
});
	return false;
}



