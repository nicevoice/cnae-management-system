//保存查询记录
var querys = [], index=0;
$(function(){
	loadInfo();
	$('#reflash').click(loadInfo);
	$("#queryDb").click(queryDb);
	$("#queryString").keydown(function(e) {
    if(e.keyCode === 13) {
      queryDb();
    }else if(e.keyCode === 38){
        $("#queryString").val(querys.length>0?querys[index--] :"");
        if(index<0) index = 0;
    }else if(e.keyCode === 40){
        if(index+1 === querys.length)
            return;
        $("#queryString").val(querys.length>0?querys[++index] :"");     
    }
  });
});

function loadInfo(){
  $.ajax({
    cache : false,
    type : "get",
    url : "/monitor/load",
    dataType:'json',
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderAdminInfo(data.content);
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
  showGrid();
}
var tplDbInfo = '<table id="info-table">'+
			  '<tr><td>注册用户数:$userNum$</td></tr>'+
			  '<tr><td>创建应用数:$appNum$</td></tr>'+
              '<tr><td>应用系统信息</td><td>$appInfo$</td></tr></table>';
function renderAdminInfo(content){
	$("#db-info").html(tplReplace(tplDbInfo, {
        '$userNum$':content.userNum,
        '$appNum$':content.appNum,
        '$appInfo$':content.appInfo  
        }));
}

function dateFormat(ts) {
	var date = new Date();
	date.setTime(ts);
	return [date.getMonth()+1, '/', date.getDate(),' ',
		date.getHours() <= 9 ? '0' + date.getHours() : date.getHours(), ':',
		date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes(), ':',
		date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds()
		].join('');
}
$('#start_app').click(function(){
	var app = $('#app_name').val();
	if(app == ''){
		alert('must input app name');
		return;
	}
	var url = '/monitor/app/' + app + '/run';
	$.ajax({
		type: 'post',
        dataType:'json',
		url: url,
		data:{
		  _csrf:_csrf
		},
		success: function(data){
			alert(data.status)
			window.location.reload();
		}
	});
});
function showGrid(){
	$.ajax({
		type: 'get',
		url: '/monitor/apps_detail',
        dataType:'json',
		success: function(data){
			var table = [];
			for(var app in data){
				var row = data[app];
				table[table.length] = [
					app,
					row.rss,
					row.heap,
					row.uptime,
					dateFormat(row.last),
					row.pid,
					row.autorun,
					row.running,
					row.ports.join(', '),
					row.running
				];
			}
			$('#contents').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="apps"></table>');
			$('#apps').dataTable({
				"aaData": table,
				"aoColumns": [
					{"sTitle": "app"},
					{"sTitle": "rss"},
					{"sTitle": "heap"},
					{"sTitle": "uptime"},
					{"sTitle": "last"},
					{"sTitle": "pid"},
					{"sTitle": "autorun"},
					{"sTitle": "running"},
					{"sTitle": "ports"},
					{
						"sTitle": "operaton",
						"fnRender": function(obj) {
							var value = obj.aData[obj.iDataColumn];
							var title = value ? 'stop app' : 'start app';
							var opt = value ? 0 : 1;
							var res = '<input type="button"  class= "button_orange r3px monitor-button opt" value="' + title
										+ '" app="' + obj.aData[0]
										+ '" opt="' + opt
										+ '" class="opt" />'
										+ ' <input type="button" value="std info" class="button_orange r3px std monitor-button"'
										+ ' app="' + obj.aData[0]
										+ '" />';
							return res;
						}
					}
				]
			});
		}
	});
}
//window.setInterval(showGrid, 10000);

function showStd(app){
	$.ajax({
		type:'get',
		url : '/monitor/app_log/out/' + app + '/last/1000',
		success : function(data) {
			$('.std_msg').show();
			$('#stdout').html(data);
		}
	})
	$.ajax({
		type:'get',
		url : '/monitor/app_log/err/' + app + '/last/1000',
		success : function(data) {
			$('.std_msg').show();
			$('#stderr').html(data);
		}
	})
}

var std_tm, std_stop = true;
$('body').click(function(e){
	std_stop = true;
	if (std_tm) {
		window.clearInterval(std_tm);
		$('.std_msg').hide();
	}
});
$('.std_msg').click(function(e){
	e.stopPropagation();
});
$('input.std').live('click', function(e){
	std_stop = false;
	var app = $(e.target).attr('app');
	showStd(app);
    std_tm = window.setInterval(function(){
      showStd(app);
    }, 3000);
})
$('input.opt').live('click', function(event){
	var app = $(event.target).attr('app');
	var opt = $(event.target).attr('opt');
	var url = 'monitor/app/' + app;
	url += (opt == 1) ? '/run' : '/stop';
	$.ajax({
		type: 'post',
		dataType:'json',
        url: url,
        data:{
          _csrf:_csrf
        },
		success: function(data){
			alert(data.status)
			window.location.reload();
		}
	});
});

queryDb = function() {
  var queryString = $("#queryString").val().trim() || '';
  if(!queryString) {
    return false;
  }
  index = querys.push(queryString)-1;
  $.ajax({
    cache : false,
    url : "/monitor/database",
    type : "post",
    dataType : "json",
    data : {
      queryString : queryString,
      _csrf:_csrf
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试");
    },
    success : function(data) {
      $("#queryOutput").html($("#queryOutput").html()+'\n'+data.output);
      var opt = document.getElementById("queryOutput");
      opt.scrollTop = opt.scrollHeight;
      $("#queryString").val("");
    }
  })
}
