$(function(){

	$.ajax({
	cache:false,
	url:"/getOwnAuthInfo",
	type:"post",
	dataType:"json",
	data:{domain:$("#appDomain").html()},
	error:function(){
		$("#submitUpload").click(upload);
		$("#editor").click(popEditor);
	},
	success:function(data){
		if(data.active===0 || data.role>2){//如果是观察者
			$("#submitUpload").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
			$("#editor").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
		}else{
			$("#submitUpload").click(upload);
			$("#editor").click(popEditor);
		}
	}
	});
});

upload = function(){
	var file = $("#getFile").val();
	if(!file){
		sAlert("警告", "请选择要上传的文件");
		return false;
	}
	var type = file.slice(file.lastIndexOf('.')+1);
	if(!(type==='gz'||type==='zip')){
		sAlert("警告", "请上传正确的格式");
		return false;
	}
	$("#uploading").css("display", "block");
}
popEditor = function(){
	var domain = $("#appDomain").html();
	var url = "http://"+location.host+"/editor/"+domain;
	window.open(url);
}