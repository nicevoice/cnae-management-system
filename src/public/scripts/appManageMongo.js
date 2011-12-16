var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
//保存查询记录
var querys = [], index=0;
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
var tplNonDb = '<form method="post" action="$url$/createMongo">'+
                '<input type="hidden" name="_csrf" value="'+ _csrf +'">'+
               ' <p class="redText">数据库尚未创建</p>'+
               '<p class="redText">点击创建应用的数据库:<input type="submit" class="button_orange r3px" id="createDb" value="创建"></p>'+
               '</form>',
    tplNotMongo = '<p class="redText">已使用其他数据库</p>';
    tplMongo = '<div class="divCenter">' +
               '<input type="text" class="longInput" id="queryString"><input type="button"  class="button_orange r3px" id="queryDb" value="执行">'
               +'<span class="redText">tips: use mongo shell</span>'+
               '</div>'+
               '<pre id="queryOutput"></pre>'+
               '<div class="r3px subContent littleBlue">'+
               '<table id="dbInfo">'+
               '<tr><td>数据库帐号：</td><td>$dbUserName$</td><td>数据库密码:</td><td>$dbPassword$</td></tr>'+
               '<tr><td>数据库名称：</td><td>$dbName$</td><td>数据库端口：</td><td>$dbPort$</td></tr>'+
               '</table>'+
               '<p>mongoSkin连接url:<input type="text" id="mongoskinUrl" readonly="readonly" value="$dbUserName$:$dbPassword$@$dbHost$:$dbPort$/$dbName$"></p>'+
               '</div>';
            
function renderAppDbInfo(dbInfo) {
  var html = "";
  if(!dbInfo.dbType) {
      var url = location.href;
      url = url.slice(0, url.lastIndexOf('/'));
      html += tplReplace(tplNonDb, {
          '$url$':url
      });
  } else if(dbInfo.dbType !== 'mongo') {
      html += tplNotMongo;
  } else {
      html += tplReplace(tplMongo, {
          '$dbUserName$':dbInfo.dbUserName,
          '$dbPassword$':dbInfo.dbPassword,
          '$dbName$':dbInfo.dbName,
          '$dbPort$':dbInfo.appDb.port,
          '$dbHost$':dbInfo.appDb.host
      })
  }
  $("#mongoDb-Info").html(html);
}

function bindButtions() {
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "get",
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
    }else if(e.keyCode === 38){
        $("#queryString").val(querys.length>0?querys[index--] :"");
        if(index<0) index = 0;
    }else if(e.keyCode === 40){
        if(index+1 === querys.length)
            return;
        $("#queryString").val(querys.length>0?querys[++index] :"");     
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
  index = querys.push(queryString)-1;
  if(!checkQueryString(queryString)) {
      $("#queryOutput").html($("#queryOutput").html()+'\n'+"该操作不被允许:"+queryString);
      var opt = document.getElementById("queryOutput");
      opt.scrollTop = opt.scrollHeight;
      $("#queryString").val("");
    return false;
  }
  $.ajax({
    cache : false,
    url : "/application/manage/" + domain + "/queryMongo",
    type : "post",
    dataType : "json",
    data : {
      queryString : queryString,
      _csrf:_csrf
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试");
    },
    success : function(data) {
      var output = htmlSpecial(data.output);
      $("#queryOutput").html($("#queryOutput").html()+'\n'+output);
      var opt = document.getElementById("queryOutput");
      opt.scrollTop = opt.scrollHeight;
      $("#queryString").val("");
    }
  })
}
