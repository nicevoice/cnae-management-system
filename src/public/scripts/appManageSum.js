var statusTimer;
//获取状态信息的定时器
var savePort = true;
var run = false;
var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function() {
  loadAppInfoContent();
});
function bindButtons() {
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "get",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function() {
      $("#controlApp").click(controlApp);
      $("#controlAppRestart").click(restart);
    },
    success : function(data) {
      if(data.active === 0 || data.role > 2) {//如果是观察者或者未激活
        $("#controlApp").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#controlAppRestart").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
      } else {
        $("#controlApp").click(controlApp);
        $("#pubApp").click(pubApp);
      }
    }
  });
}

function formatUptime(uptime) {
  uptime = Math.round(uptime);
  var cut = [86400, 3600, 60, 1];
  var name = ['天', '小时', '分钟', '秒']
  var res = [], num;
  for(var i = 0; i < cut.length; i++) {
    if(uptime == 0) {
      break;
    }
    num = cut[i];
    if(uptime < num) {
      continue;
    }
    res.push(Math.floor(uptime / num) + name[i]);
    uptime = uptime % num;
  }
  return res.join(' ');
}

//读取appInfo
function loadAppInfoContent() {
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_sum",
    dataType : "json",
    error : function() {
    },
    success : function(data) {
      if(data.status === "ok") {
        var content = data.content;
        renderAppInfos(data.content);
        bindButtons();
        setStatus();
        window.setInterval(function() {
          setStatus();
        }, 10000);
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}
var tplSum  =  '<table style="width:600px">'+
               '<tr><td style="width:150px">应用域名：</td><td style="width:400px" id="appDomains"></td></tr>'+
               '<tr><td>应用名称：</td><td>$appName$</td></tr>'+
               '<tr><td>应用描述：</td><td>$appDes$</td></tr>'+
               '<tr><td>应用状态:</td><td id="appStateDes"></td></tr>'+
               '<tr><td>数据库：</td><td id="appDbName">$db$</td><tr>'+
               '</table>'+
               '<h3>应用状态信息</h3><table id="status">'+
               '<tr><th>内存消耗</th><th>堆内存</th><th>运行时间</th><th>心跳时间</th><th>PID</th></tr>'+
               '<tr id="statusInfo"></tr>'+
               '</table>';
var tplSumLabs  =  '<table style="width:600px">'+
               '<tr><td>应用名称：</td><td>$appName$</td></tr>'+
               '<tr><td>应用状态:</td><td id="appStateDes"></td></tr>'+
               '<tr><td>数据库：</td><td id="appDbName">$db$</td><tr>'+
               '</table>'+
               '<h3>应用状态信息</h3><table id="status">'+
               '<tr><th>内存消耗</th><th>堆内存</th><th>运行时间</th><th>心跳时间</th><th>PID</th></tr>'+
               '<tr id="statusInfo"></tr>'+
               '</table>';
function renderAppInfos(app){
    var params = {};
    params['$appName$'] = htmlSpecial(app.appName);
    params['$appDes$'] = htmlSpecial(app.appDes);
    if(app.dbType === 'mongo'){
        params['$db$'] = (app.dbName + '</td><td style="width:150px">端口号:'+ app.appDbPort +'</td>');
    }else{
        var url = location.href;
        url = url.slice(0, url.lastIndexOf('/'));        
        params['$db$']=('<a href="' + url + '/mongo">点此启用mongoDB</a></td>');
    }
    if($('#labs').html()==='true'){
    $('#appInfos').html(tplReplace(tplSumLabs, params));
    }else{
    $('#appInfos').html(tplReplace(tplSum, params));
    }
}

//设置应用信息
function setStatus() {
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/getStatus",
    dataType : "json",
    data : {
      savePort : savePort,
      _csrf:_csrf
    },
    error : function() {
    },
    success : function(status) {
      var savePort = false;
      var appDomains = "", //显示域名的html
      appRunning = "", //显示应用是否启动
      appStatusInfo = "", //显示应用状态信息
      appButtonName = "";
      //显示button的名字
      //填入域名信息
      if(!status.running) {
        appDomains = '<a href="http://' + status.appDomain + '" target="_blank">' + status.appDomain + '</a> <span class="redText">未启用</sapn>';
      } else {
        for(var i = 0, len = status.ports.length; i < len; ++i) {
          var port = status.ports[i];
          if(!port || port == 80) {
            port = "";
          } else {
            port = ":" + port;
          }
          appDomains += '<a href="http://' + status.appDomain + port + '" target="_blank">' + status.appDomain  + port + '</a><br />';
        }
        if(status.ports.length===0){
          appDomains = '<a href="http://' + status.appDomain + '" target="_blank">' + status.appDomain + '</a> <span class="redText">未监听端口</sapn>';
        }
      }
      //填入是否启用信息
      if(status.running === true) {
        appRunning = "已上线";
        appButtonName = "下线";
        run = true;
      } else {
        appRunning = "未上线";
        appButtonName = "上线";
        run = false;
      }
      //填入详细应用信息
      appStatusInfo = '<td>' + parseFloat((status.rss / 1048576).toFixed(2)) + 'MB</td>' + '<td>' + parseFloat((status.heap / 1048576).toFixed(2)) + 'MB</td>' + '<td>' + formatUptime(status.uptime) + '</td>' + '<td>' + status.last + '</td>' + '<td>' + status.pid + '</td>';
      $("#appDomains").html(appDomains);
      $("#appStateDes").html(appRunning);
      $("#statusInfo").html(appStatusInfo);
      $("#controlApp").attr("value", appButtonName);
    }
  });
}

function addRecord(domain, action) {
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/addRecord",
    dataType : "json",
    data : {
      action : action,
      _csrf:_csrf
    },
    error : function() {
    },
    success : function() {
    }
  });
}

function controlApp() {
  var action = "start";
  if(run){
    action = "stop";
  };
  var thisApp = $(this), stateDes = $("#appStateDes");
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/controlApp",
    dataType : "json",
    data : {
      action : action,
      _csrf : _csrf,
      type : 'online'
    },
    error : function() {
    },
    success : function(data) {
      if(data.status === "ok") {
        setStatus();
        if(thisApp.val() === "上线") {
          thisApp.val("下线");
          addRecord(domain, "应用上线");
        } else {
          thisApp.val("上线");
          addRecord(domain, "应用下线");
        }
      } else {
        if(data.msg.indexOf('Cannot find module')===0){
          data.msg = "请先发布您的应用";
        }
        sAlert("警告", data.msg);
      }
    }
  })
}

function pubApp() {
  var str = '发布应用将会覆盖当前线上程序，确认要发布么？';
  if (!confirm(str)) {
    return false;
  }
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/controlApp",
    dataType : "json",
    data : {
      _csrf : _csrf,
      action : "pub",
      type : "online"
    },
    error : function() {},
    success : function(data){
      if(data.status === "ok") {
        setStatus();
        sAlert("", "应用已发布并重启");
        $("#controlApp").val("下线");
        stateDes.html("已启用");
        addRecord(domain, "应用发布");
      } else {
        sAlert("警告", data.msg);
      }
    }      
  })
}
