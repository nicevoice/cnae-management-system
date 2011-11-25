var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
var validator = new Validator();
$(function() {
  loadAppInfo();
});
function loadAppInfo() {
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_appmng",
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderAppInfo(data.content.appInfo);
        bindButtons();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}
var tplInfo = '<form method="post" action="$url$/appmng">'+
              '<p>子域名：&nbsp;&nbsp;&nbsp;&nbsp;<span id="submitAppDomain">$appDomain$</span></p>'+
              '<p>应用名：&nbsp;&nbsp;&nbsp;&nbsp;<input class="newLongInput" type="text" id="newAppName" name="newAppName" value="$appName$"></p>'+
              '<p>github：&nbsp;&nbsp;&nbsp;&nbsp;<input class="newLongInput"type="text" id="newGithub" name="newGithub" value="$github$"></p>'+
              '<p>图片地址：<input type="text" class="newLongInput" id="newImgSource" name="newImgSource" value="$imgSource$"></p>'+
              '<p>应用描述：</p>'+
              '<p style="margin-left:80px;"><textarea rows="3" class="newLongInput" name="newAppDes" id="newAppDes">$appDes$</textarea></p>'+
              '<p><input id="submitAppInfo" type="button" class="button button_orange r3px" value="修改">'+
              '</form>';
function renderAppInfo(appInfo) {
  var appDomain = appInfo.appDomain || '',
      appName = appInfo.appName || '', 
      appDes = appInfo.appDes || '',
      github = appInfo.github||'',
      imgSource = appInfo.imgSource||'',
      url = location.href;
  url = url.slice(0, url.lastIndexOf('/'));
  $("#appmng-content").html(tplReplace(tplInfo, {
      '$url$':url,
      '$appDomain$':appDomain,
      '$appName$':appName,
      '$appDes$':appDes,
      '$github$':github,
      '$imgSource$':imgSource
  }));
}

function bindButtons() {
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "post",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function() {
      $("#submitAppInfo").click(submitNewAppInfo);
    },
    success : function(data) {
      if(data.active === 0 || data.role > 1) {//如果不是创建者和管理员
        $("#submitAppInfo").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
      } else {
        $("#submitAppInfo").click(submitNewAppInfo);
      }
    }
  });
}

//修改应用信息
function submitNewAppInfo() {
  var newAppName = $("#newAppName").val(),
      newAppDes = $("#newAppDes").val(),
      newGithub = $("#newGithub").val(),
      newImgSource = $("#newImgSource").val();
  if(!newAppName){
  	  sAlert("警告", "必须输入应用名称");
  	  return false;
  	}
  if(newGithub&&!validator.verify('githubPage', newGithub)){
  	  sAlert("警告", "github地址不正确");
  	  return false;
  	} 
  if(newImgSource&&!validator.verify('imgSource', newImgSource)){
  	  sAlert("警告", "图片地址不正确");
  	  return false;
  	} 
  var url = $("form").attr('action');
  $.ajax({
    cache : false,
    type : "POST",
    url : url,
    dataType : "json",
    data : {
      newAppName : newAppName,
      newAppDes : newAppDes,
      newGithub : newGithub,
      newImgSource : newImgSource
    },
    error : function() {
      sAlert("警告", "提交请求错误，请稍后再试");
    },
    success : function(data) {
      if(data.status === 'error')
        sAlert("警告", data.msg);
      else {
        sAlert("", "修改成功！");
      }
    }
  });
  return false;
}
