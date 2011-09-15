var appNums = 0,
    onceNum = 20;
$(function(){
  getMore();
  $("#getMore").click(getMore);
})

function getMore(){
  $("#getMore").html("加载中...");
  $.ajax({
    cache:false,
    type:"get",
    url:"/square/post",
    data:{skip:appNums, limit:onceNum},
    dataType:"json",
    error:function(){
      $("#getMore").html("获取失败，请稍后再试");
    },
    success:function(data){
      if (data.status === "ok") {
        render(data.apps);
        $("#getMore").html("更多");
        appNums += onceNum;
      }
      else{
        $("#getMore").html(data.msg);        
      }
    }
  });
}
function render(data){
  var html="";
  for(var i=0, len=data.length; i<len; ++i){
    html += renderApp(data[i]);
  }
  $("#square-apps").html($("#square-apps").html()+html);
}

function renderApp(app){
  if(!app.appName || !app.appDomain ||
     !app.creatorEmail || !app.creatorNickName ||
     !app.memberNums){
       return "";
     }
  var port="";
  if(app.port && app.port!=80){
    port=":"+app.port;
  }
  var div = '<div class="app-info">' +
            '<p><img src="/images/arrow.gif"></img><span class="appTitle">'+
            app.appName+'</span>&nbsp;&nbsp;<a href=">'+app.appDomain+'.cnodejs.net'+port+'" target="_blank">' +
            app.appDomain+'.cnodejs.net</a></p>' + 
            '<p>'+app.appDes+'</p>' +
            '<p class="font11">'+app.creatorNickName + '创建于' + app.appCreateDate +' | 有'+app.memberNums +'个参与者</p></div>';
  return div;
}
