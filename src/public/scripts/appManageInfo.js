var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
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

function renderAppInfo(appInfo) {
  var html = "", appDomain = appInfo.appDomain || '', appName = appInfo.appName || '', appDes = appInfo.appDes || '', url = location.href;
  url = url.slice(0, url.lastIndexOf('/'));
  html += '<form method="post" action="' + url + '/appmng">' + '<p>子域名：<span id="submitAppDomain">' + appDomain + '</span></p>' + '<p>应用名：<input type="text" id="newAppName" name="newAppName" value="' + appName + '"></p>' + '<input type="text" style="display:none">' + '<p>应用描述:</p>' + '<p><textarea rows="3" class="newLongInput" name="newAppDes" id="newAppDes">' + appDes + '</textarea></p>' + '<p><input id="submitAppInfo" type="button" class="button_orange r3px" value="修改">' + '<input type="button" class="button_orange r3px" value="取消" onclick="javascript: history.back();">' + '</form>';
  $("#appmng-content").html(html);
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
  var newAppName = $("#newAppName").val();
  var newAppDes = $("#newAppDes").val();
  var url = $("form").attr('action');
  $.ajax({
    cache : false,
    type : "POST",
    url : url,
    dataType : "json",
    data : {
      newAppName : newAppName,
      newAppDes : newAppDes
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