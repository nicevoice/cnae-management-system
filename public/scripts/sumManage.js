var statusTimer;	//获取状态信息的定时器
$(function(){
	setStatus();
	window.setInterval(function(){
		setStatus();
	}, 10000);
	$.ajax({
	cache:false,
	url:"/getOwnAuthInfo",
	type:"post",
	dataType:"json",
	data:{domain:$("#appDomain").html()},
	error:function(){
			$("#controlApp").click(controlApp);
			$("#controlAppRestart").click(restart);
		},
	success:function(data){
		if(data.active===0 || data.role>2){//如果是观察者或者未激活
			$("#controlApp").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
			$("#controlAppRestart").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
		}else{
			$("#controlApp").click(controlApp);
			$("#controlAppRestart").click(restart);
		}
	}
	});
})
function formatUptime(uptime){
	uptime = Math.round(uptime);
	var cut = [86400, 3600, 60, 1];
	var name = ['天', '小时', '分钟', '秒']
	var res = [], num;
	for (var i = 0; i < cut.length; i++) {
		if (uptime == 0){
			break;
		}
		num = cut[i];
		if (uptime < num) {
			continue;
		}
		res.push(Math.floor(uptime / num) + name[i]);
		uptime = uptime % num;
	}
	return res.join(' ');
}

//设置应用信息
function setStatus(){
	var domain = $("#appDomain").html()||'';
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/getStatus",
	dataType:"json",
	data:{},
	error:function(){
	},
	success:function(status){
		var appDomains="",	//显示域名的html
			appRunning="",	//显示应用是否启动
			appStatusInfo="",//显示应用状态信息
			appButtonName="";//显示button的名字
		//填入域名信息
		if(status.ports.length == 0){
			appDomains = '<a href="http://'+domain+'.cnodejs.net'+port+
				'" target="_blank">'+domain+'.cnodejs.net</a> <span class="redText">未启用</sapn>';
		}else{
			for(var i=0, len=status.ports.length; i<len; ++i){
				var port = status.ports[i];
				if(port==80){
					port = "";
				}else{
					port = ":" + port;
				}
				appDomains+='<a href="http://'+domain+'.cnodejs.net'+port+
				'" target="_blank">'+domain+'.cnodejs.net'+port+'</a><br />';
			}
		}
		//填入是否启用信息
		if(status.running===true){
			appRunning = "已启用";
			appButtonName = "下线";
		}else{
			appRunning = "未启用";
			appButtonName = "上线";
		}
		//填入详细应用信息
		appStatusInfo =  '<td>'+parseFloat((status.rss / 1048576).toFixed(2))+'MB</td>' +
						 '<td>'+parseFloat((status.heap / 1048576).toFixed(2))+'MB</td>' +
						 '<td>'+formatUptime(status.uptime)+'</td>' +
						 '<td>'+status.last+'</td>' +
						 '<td>'+status.pid+'</td>';
		$("#appDomains").html(appDomains);
		$("#appStateDes").html(appRunning);
		$("#statusInfo").html(appStatusInfo);
		$("#controlApp").attr("value", appButtonName);
	}
	});	
}
addRecord = function(domain, action){
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/addRecord",
	dataType:"json",
	data:{action:action},
	error:function(){},
	success:function(){}
	});
}
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
			setStatus();
			if(thisApp.val()==="上线"){
				thisApp.val("下线");
				stateDes.html("已启用");
				addRecord(domain, "应用上线");
			}else{
				thisApp.val("上线");
				stateDes.html("未启用");
				addRecord(domain, "应用下线");
			}
		}else{
			sAlert("警告", data.msg);
		}
	}
	})
}

restart = function(){
	var domain = $("#appDomain").html(),
		stateDes = $("#appStateDes");
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/controlApp",
	dataType:"json",
	data:{action:"restart"},
	error:function(){
		sAlert("警告","操作失败");
	},
	success:function(data){
		if(data.status!=="ok"){
			if(data.code==202){	//not found错误，则改为上线
				$.ajax({
					cache:false,
					type:"post",
					url:"/application/manage/"+domain+"/controlApp",
					dataType:"json",
					data:{action:"start"},
					error:function(){
						sAlert("警告","操作失败");
					},
					success:function(data){
						if(data.status==="ok"){
						setStatus();
						sAlert("","应用已重启");
						$("#controlApp").val("下线");
						stateDes.html("已启用");
						addRecord(domain, "应用重启");
						}else{
							sAlert("警告",data.msg);
						}
					}
				})
			}else{
			sAlert("警告", data.msg);
			}
		}else
			{
			setStatus();
			sAlert("","应用已重启");
			$("#controlApp").val("下线");
			stateDes.html("已启用");
			addRecord(domain, "应用重启");
		}
	}
	});
}
