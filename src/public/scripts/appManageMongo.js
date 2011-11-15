var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function() {
  loadAppDbInfo();
});
function loadAppDbInfo() {
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_mongo",
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderAppDbInfo(data.content);
        bindButtions();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderAppDbInfo(dbInfo) {
  var html = "<br />";
  if(!dbInfo.dbType) {
    var url = location.href;
    url = url.slice(0, url.lastIndexOf('/'));
    html += '<form method="post" action="' + url + '/createMongo">' + ' <p class="redText">数据库尚未创建</p> <p class="redText">点击创建应用的数据库:' + '<input type="submit" class="button_orange r3px" id="createDb" value="创建"></p></form>';
  } else if(dbInfo.dbType !== 'mongo') {
    html += ' <p class="redText">已使用其他数据库</p>';
  } else {
    html += '<div class="divCenter">' + '<input type="text" class="longInput" id="queryString"><input type="button"  class="button_orange r3px" id="queryDb" value="执行">' + '<span class="redText">tips: use mongo shell</span>' + ' </div><pre id="queryOutput"></pre>' + '<div class="r3px subContent littleBlue">' + ' <h3>自行连接数据库，请使用以下参数</h3>' + ' <table id="dbInfo">' + '<tr><td>数据库帐号：</td><td>' + dbInfo.dbUserName + '</td><td>数据库名称：</td><td>' + dbInfo.dbName + '</td></tr>' + '<tr><td>数据库密码：</td><td>' + dbInfo.dbPassword + '</td><td>数据库端口：</td><td>20088</td>' + '</tr></table>' + '<p>mongoSkin连接url：</p>' + '<p><input type="text" id="mongoskinUrl" readonly="readonly" value="' + dbInfo.dbUserName + ':' + dbInfo.dbPassword + '@127.0.0.1:20088/' + dbInfo.dbName + '"></p></div>';
  }
  $("#mongoDb-Info").html(html);
}

function bindButtions() {
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "post",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function() {
      $("#queryDb").click(queryDb);
    },
    success : function(data) {
      if(data.active === 0 || data.role > 1) {//如果不是管理者或者创建者
        $("#createDb").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#queryDb").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
      } else {
        $("#queryDb").click(queryDb);
      }
    }
  });
  $("#queryString").keydown(function(e) {
    if(e.keyCode === 13) {
      queryDb();
    }
  });
}

checkQueryString = function(queryString) {
  if(queryString.indexOf("db.") !== 0 && queryString.indexOf("show") !== 0) {
    return false;
  } else {
    if(queryString.indexOf("db.addUser") === 0 || queryString.indexOf("db.auth") === 0 || queryString.indexOf("db.removeUser") === 0 || queryString.indexOf("db.eval") === 0 || queryString.indexOf("db.dropDatabase") === 0 || queryString.indexOf("db.shoutdownServer") === 0 || queryString.indexOf("db.copyDatabase") === 0 || queryString.indexOf("db.cloneDatabse") === 0) {
      return false;
    } else {
      return true;
    }
  }
}
queryDb = function() {
  var queryString = $("#queryString").val().trim() || '';
  if(!queryString) {
    return false;
  }
  if(!checkQueryString(queryString)) {
    $("#queryOutput").html("该操作不被允许");
    return false;
  }
  $.ajax({
    cache : false,
    url : "/application/manage/" + domain + "/queryMongo",
    type : "post",
    dataType : "json",
    data : {
      queryString : queryString
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试");
    },
    success : function(data) {
      $("#queryOutput").html(data.output);
    }
  })
}