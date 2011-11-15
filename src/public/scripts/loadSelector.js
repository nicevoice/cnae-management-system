var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);

$(function() {
  loadSelector();
});
function loadSelector() {
  var getUrl = url + '/load_allapp';
  $.ajax({
    cache : false,
    type : "get",
    url : getUrl,
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        var content = data.content;
        renderSelector(data.content.apps);
        changeApp();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderSelector(apps) {
  var length = apps.length, html = "";
  html += '<select id="select_app">';
  for(var i = 0; i != length; ++i) {
    var app = apps[i];
    html += '<option value="' + app.appDomain + '"';
    if(app.appDomain === domain) {
      html += 'selected';
    }
    html += '>' + app.appName + '</option>';
  }
  html += '</select>';
  $("#app-selector").html(html);
}

function change() {
  var domain = this.options[this.options.selectedIndex].value;
  location.href = location.href.replace(/manage\/\w+/, "manage/" + domain);
}

function changeApp() {
  if(!document.getElementById)
    return false;
  var select = document.getElementById("select_app");
  if(!select)
    return false;
  select.onchange = change;
}