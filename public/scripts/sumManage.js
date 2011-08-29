$(function(){
	$("#controlApp").click(controlApp);
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
		if(data.done){
			sAlert("","操作成功");
			if(thisApp.val()==="上线"){
				thisApp.val("下线");
				stateDes.html("已启动");
				
			}else{
				thisApp.val("上线");
				stateDes.html("未启动");
			}
		}else{
			sAlert("警告", "操作失败");
		}
	}
	})
}