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
var tplSelecte = '<select id="select_app">'+
                  '$options$'+
                  '</select>',
    tplOption = '<option value="$appDomain$" $selected$>$appName$</option>';
function renderSelector(apps){
    var optionContent = "";
    for(var i=0, len=apps.length; i!=len; ++i){
        var app = apps[i], selected="";
        if(app.appDomain === domain){
            selected="selected";
            $("#app-name").html(app.appName);
        }
        optionContent += tplReplace(tplOption, {
            '$appDomain$':app.appDomain,
            '$appName$':app.appName,
            '$selected$':selected
        })
    }
  $("#app-selector").html(tplReplace(tplSelecte, {
      '$options$':optionContent
  }));
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