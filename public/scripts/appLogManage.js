$(function(){
	getOutput("stdout");
	getOutput("stderr");
	window.setTimeout(function(){	
		getOutput("stdout");					
	}, 10000);
	window.setTimeout(function(){
		getOutput("stderr");
	}, 10000);	
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
		window.setTimeout(function(){	//如果ajax失败，则在30秒后才会再去读取
		getOutput(action);
		},30000);
	},
	success:function(data){								
		$("#"+action).html(data.output);
		window.setTimeout(function(){	
			getOutput(action);
		},10000);
	}
	});	
}