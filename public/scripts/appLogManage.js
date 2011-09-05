$(function(){
	window.setTimeout(function(){	
		getOutput("stdout");					
	}, 10);
	window.setTimeout(function(){
		getOutput("stderr");
	}, 10);	
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
		var res = data.output;
		res = res.replace(/&/g, '&amp;');
		res = res.replace(/</g, '&lt;');
		res = res.replace(/>/g, '&gt;');
		res = res.replace(/'/g, '&acute;');
		res = res.replace(/"/g, '&quot;');
		res = res.replace(/\|/g, '&brvbar;');
		alert(res);
		$("#"+action).html(res);
		window.setTimeout(function(){	
			getOutput(action);
		},10000);
	}
	});	
}