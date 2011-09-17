var appNums = 0,
    onceNum = 20;
$(function(){
  getMore();
  $("#getMore").click(getMore);
})
function bindDiv(){
    $("div .app-info").each(function(index){
		$(this).mouseenter(function() {
			$('.app-info-right:eq(' + index + ')').css("display", "block");
			});
			$(this).mouseleave(function() {
			$('.app-info-right:eq(' + index + ')').css("display", "none");
			});
  });
}

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
  $("#all-apps").html($("#all-apps").html()+html);
  bindDiv();
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
  var div = '<div class="app-info clearfix"><div class="app-info-left">' +
            '<p class="app-title"><img src="/images/arrow.gif"></img><a href="http://'+app.appDomain+'.cnodejs.net'+port+'" target="_blank">'+
            app.appName +'</a></p>' + 
            '<p class="app-des">描述：'+app.appDes+'</p>' +
            '<p class="app-mem"><a href="/square/'+app.creatorNickName+'">'+
            app.creatorNickName + '</a> 创建于' + app.appCreateDate +' • 有'+app.memberNums +'个参与者  '+
            '</p></div><div class="app-info-right">'+'<a class="blockA likeBlue" href="javascript:void(0)" onclick="apply(\''+app.appDomain+'\',\''+app.appName+'\',\''+app.creatorEmail+'\',\''+app.creatorNickName+'\')">申请参加</a>'+
            '</div></div>';
  return div;
}

function apply(domain, name, email, nickName){
  var reason = "";
  if(null===(reason=prompt("申请说明：",""))){
    return false;
  }
  $.ajax({
    cache:false,
    type:"post",
    url:"/appSquare/apply",
    dataType:"json",
    data:{domain:domain, name:name, email:email, nickName:nickName, reason:reason},
    error:function(){
      sAlert("警告","申请失败，请稍后再试");
    },
    success:function(data){
      if(data.status==="ok"){
        sAlert("", "申请已发出，请等候对方回应");
      }else{
        sAlert("警告", data.msg);
      }
    }
  })
}
