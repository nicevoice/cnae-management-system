$(function(){
  getPersonApps();
})
function getPersonApps(){
  var nickName = $("#ownerNickName").html()||'';
  $.ajax({
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
  $('.smallPic a').fancyZoom({scaleImg: true, closeOnClick: true});
  if(ownHtml===""){
    $("#own-apps").html('<div>没有创建任何应用</div>');
  }
  if(otherHtml===""){
    $("#other-apps").html('<div>没有参与任何应用</div>');
  }
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
