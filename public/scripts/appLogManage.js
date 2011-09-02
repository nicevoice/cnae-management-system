var outTimer, errTimer;	//获取日志定时器id
$(function(){
	getOutput("stdout");
	//getOutput("stderr");
	outTimer = window.setInterval(function(){
		getOutput("stdout");
	}, 10000);
//	errTimer = window.setInterval(function(){
//		getOutput("stderr");
//	}, 10000);	
})

function getOutput(action){
	var domain = $("#appDomain").html();
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/getStdOutput",
	dataType:"json",
	data:{action:action},
	error:function(){
		$("#"+action).html(action + "获取失败");
	},
	success:function(data){
		$("#"+action).html(data.output);
	}
	});	
}