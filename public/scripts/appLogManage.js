$(function(){
	getOutput("stdout");
	getOutput("stderr");
	window.setTimeout(function(){	//因为如果读不到数据，就会等到超时，因此这里用setTimeout，
		getOutput("stdout");					//下面根据是否读取到数据来确定下一次的读取间隔
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
		window.setTimeout(function(){	//如果ajax失败，则在60秒后才会再去读取
		getOutput(action);
		},60000);
	},
	success:function(data){								//如果读不到数据，则在30秒后再读取
		$("#"+action).html(data.output);
		window.setTimeout(function(){	//如果读取不到数据，则在30秒后才会再去读取
			getOutput(action);
		},30000);		
		}
	});	
}