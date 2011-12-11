$(function(){
  getPersonApps();
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
function getPersonApps(){
  var nickName = $("#ownerNickName").html()||'';
  $.ajax({
    cache:false,
    type:"get",
    url:"/square/apps",
    data:{nickName:nickName},
    dataType:"json",
    error:function(){
      $("#square-apps").html("获取失败，请稍后再试...");
    },
    success:function(data){
      if (data.status === "ok") {
        renderPersonSqual(data.apps, data.owner);
      }
      else{
        $("#square-apps").html(data.msg);        
      }
    }
  });
}
function renderPersonSqual(data, owner){
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
