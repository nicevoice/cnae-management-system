$(function(){
  getApps();
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
function getApps(){
  var nickName = $("#ownerNickName").html()||'';
  $.ajax({
    cache:false,
    type:"get",
    url:"/square/post/personal",
    data:{nickName:nickName},
    dataType:"json",
    error:function(){
      $("#square-apps").html("获取失败，请稍后再试...");
    },
    success:function(data){
      if (data.status === "ok") {
        render(data.apps, data.owner);
      }
      else{
        $("#square-apps").html(data.msg);        
      }
    }
  });
}
function render(data, owner){
  var ownHtml="", otherHtml="";
  for (var i = 0, len = data.length; i < len; ++i) {
    if (owner === data[i].creatorEmail){ 
      ownHtml += renderApp(data[i]);
  }else{
      otherHtml += renderApp(data[i]);
    }
  }
  $("#own-apps").html($("#own-apps").html()+ownHtml);
  $("#other-apps").html($("#other-apps").html()+otherHtml);
  if(ownHtml===""){
    $("#own-apps").html('<div>没有创建任何应用</div>');
  }
  if(otherHtml===""){
    $("#other-apps").html('<div>没有参与任何应用</div>');
  }
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
  var photo="";
  if(app.photoUrl){
    photo += '<img src="'+app.photoUrl+'" style="width: 25px; height: 25px;">';
  }
  var div = '<div class="app-info clearfix"><div class="app-info-left">' +
            '<p class="app-title"><img src="/images/arrow.gif"></img><a href="http://'+app.appDomain+'.cnodejs.net'+port+'" target="_blank">'+
            app.appName +'</a></p>' + 
            '<p class="app-des">描述：'+app.appDes+'</p>' +
            '<p class="app-mem"><a href="/square/'+app.creatorNickName+'">'+ photo +
            app.creatorNickName + '</a> 创建于' + app.appCreateDate +' • 有'+app.memberNums +'个参与者  '+
            '</p></div><div class="app-info-right">'+'<a class="blockA likeBlue" href="javascript:void(0)" onclick="apply(\''+app.appDomain+'\',\''+app.appName+'\',\''+app.creatorEmail+'\',\''+app.creatorNickName+'\')">申请参加</a>'+
            '</div></div>';
  return div;
}

function apply(domain, name, email, nickName){
  $.ajax({
    cache:false,
    type:"post",
    url:"/appSquare/apply",
    dataType:"json",
    data:{domain:domain, name:name, email:email, nickName:nickName},
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