var appNums = 0,
    onceNum = 20;
$(function(){ 
  window.onscroll = function(){
    var backTop = $("#back-top");
    if(!backTop) return false;
    if(document.body.scrollTop<10){
      backTop.css("display", "none");
    }else{
      backTop.css("display", "block");
    }
  }
  getMore();
  $("#getMore").click(getMore);
})

function getMore(){
  $("#getMore").html("加载中...");
  $.ajax({
    type:"get",
    url:"/square/apps",
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
  $('.smallPic a').fancyZoom({scaleImg: true, closeOnClick: true});

}
var tplSquareApp = '<div class="app-info clearfix"><div class="app-info-left">' + 
                   '<p class="app-title"><img src="/images/arrow.gif"></img><a href="http://$appDomain$.cnodejs.net$port$" target="_blank">$appName$</a>$github$</p>'+
                   '<p class="app-mem"><a href="/square/$creatorNickName$">$photo$$creatorNickName$</a>'+
                   '创建于$appCreateDate$ • 有$memberNums$个参与者 <a href="javascript:void(0)" onclick="apply(\'$appDomain$\',\'$appName$\',\'$creatorEmail$\',\'$creatorNickName$\')">申请参加</a></p>'+
                   '<p class="app-des">$appDes$</p></div>'+
                   '<div class="app-info-right">'+
                   '</div><div class="app-info-image">$img$</div>'+
                   '</div>$realImg$',
    tplSmallImg = '<div class="smallPic"><a href="#$imgNum$"><img src="$imgSource$" class="app-image" alt="$appName$"></img></a></div>',
    tplRealImg = '<div id="$imgNum$" style="display:none;"><img src="$imgSource$" alt="$appName" /></div>',
    tplGithub = '&nbsp;&nbsp;<a href="$github$" title="Fork me on Github" target="_blank" width=><img width="40px" src="/images/github.jpg" alt="Github"></img></a>';
var imgNum = 0;
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
  var imgSource = "", realImg = "";
  var github = "";
  if(app.imgSource){
      imgSource = tplReplace(tplSmallImg, {
          '$imgSource$':app.imgSource,
          '$appName$':app.appName,
          '$imgNum$':'imgNum_'+imgNum
      });
      realImg = tplReplace(tplRealImg, {
          '$imgSource$':app.imgSource,
          '$appName$':app.appName,
          '$imgNum$':'imgNum_'+imgNum++
      });
  }
  if(app.github){
    	github = tplReplace(tplGithub, {
    		'$github$':app.github
    	});
  }
  return tplReplace(tplSquareApp, {
      '$appName$':app.appName,
      '$appDomain$':app.appDomain,
      '$creatorEmail$':app.creatorEmail,
      '$creatorNickName$':app.creatorNickName,
      '$memberNums$':app.memberNums,
      '$photo$':photo,
      '$appDes$':app.appDes||'<br \>',
      '$appCreateDate$':app.appCreateDate,
      '$port$':port,
      '$img$':imgSource,
      '$github$':github,
      '$realImg$':realImg
  });
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
    data:{domain:domain, name:name, email:email, nickName:nickName, reason:reason, _csrf:_csrf},
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
