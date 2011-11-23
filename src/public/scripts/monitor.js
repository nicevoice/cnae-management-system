$(function(){
	loadInfo();
	$('#reflash').click(loadInfo);
});

function loadInfo(){
  $.ajax({
    cache : false,
    type : "get",
    url : "/load_monitor",
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
}
var tplDbInfo = '<table id="info-table">'+
			  '<tr><td>注册用户数:$userNum$</td>'+
			  '<td>创建应用数:$appNum$</td></tr></table>',
    tplAppInfo = '<pre>$appInfo$</pre>';
function renderAdminInfo(content){
	$("#db-info").html(tplReplace(tplDbInfo, {
        '$userNum$':content.userNum,
        '$appNum$':content.appNum  
        }));
    $("#app-info").html(tplReplace(tplAppInfo, {
        '$appInfo$':content.appInfo
    }));
}
