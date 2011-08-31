$(function(){
	$("#controlApp").click(controlApp);
	$.ajax({
	cache:false,
	url:"/getOwnAuthInfo",
	type:"post",
	dataType:"json",
	data:{domain:$("#appDomain").html()},
	error:function(){},
	success:function(data){
		if(data.active===0 || data.role>1){//如果不是管理者或者创建者
			$("#controlApp").attr("disabled","true");
		}
	}
	});
})

controlApp = function(){
	var domain = $("#appDomain").html(),
	thisApp = $(this),
	stateDes = $("#appStateDes");
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/controlApp",
	dataType:"json",
	data:{action:thisApp.val()},
	error:function(){
		sAlert("警告","操作失败");
	},
	success:function(data){
		if(data.status==="ok"){
			if(thisApp.val()==="上线"){
				thisApp.val("下线");
				stateDes.html("已启动");
				
			}else{
				thisApp.val("上线");
				stateDes.html("未启动");
			}
		}else{
			sAlert("警告", data.msg);
		}
	}
	})
}