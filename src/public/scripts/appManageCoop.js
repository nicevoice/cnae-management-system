var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function() {
  loadCoopInfo();
});
function loadCoopInfo() {
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_coopmng",
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderCoopInfo(data.content.own, data.content.mems);
        bindButtons();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderCoopInfo(own, mems) {
  var length = mems.length, html = "";
  html += '<table id="allCoops"><tr><th>CNAE帐号</th><th>状态</th><th>操作</th><th>权限</th></tr>';
  for(var i = 0; i != length; ++i) {
    var mem = mems[i];
    html += '<tr id="' + mem.email + 'Tr">' + '<td>' + mem.email + '</td><td>';
    switch(mem.active) {
      case 0:
        html += "inactive";
        break;
      case 1:
        html += "active";
        break;
      case 2:
        html += "applying";
        break;
    }
    html += '</td><td>';
    if(mem.active < 2) {
      if(mem.role === 0) {
        html += '无法删除应用创建者';
      } else if(own.role === 0) {
        html += '<a href="javascript:void(0);" id="' + mem.email + '#' + mem.appDomain + '#delete">删除此参与者</a>';
      } else {
        html += '没有权限进行操作';
      }
    } else {
      html += '<a href="javascript:void(0);" id="' + mem.email + '#' + mem.appDomain + '#agree">同意</a> | ' + '<a href="javascript:void(0);" id="' + mem.email + '#' + mem.appDomain + '#refuse">拒绝</a>';
    }
    html += '</td><td>';
    var role;
    switch(mem.role) {
      case 0:
        role = "创建者";
        break;
      case 1:
        role = "管理者";
        break;
      case 2:
        role = "参与者";
        break;
      case 3:
        role = "观察者";
        break;
      default:
        role = "";
    }
    if(own.role === 0) {
      if(mem.role === 0) {
        html += '创建者';
      } else {
        html += '<select id="' + mem.email + 'Role">' + '<option value="1" ';
        if(mem.role === 1)
          html += 'selected';
        html += '>管理者</option>' + '<option value="2" ';
        if(mem.role === 2)
          html += 'selected';
        html += '>参与者</option>' + '<option value="3" ';
        if(mem.role === 3)
          html += 'selected';
        html += '>观察者</option></select>';
      }
    } else {
      html += role;
    }
    html += '</td></tr>'
  }
  html += '</table>';
  $("#coop-infos").html(html);
  if(own.role === 0) {
    $("#invite-form").css("display", "block");
  }
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
      $("#submitInvite").click(submitInvite);
    },
    success : function(data) {
      if(data.active === 0 || data.role > 0) {//如果不是创建者
        $("#submitInvite").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
      } else {
        $("#submitInvite").click(submitInvite);
      }
    }
  });
  bindCoop();
}

function bindCoop() {
  $("td select").each(function() {
    $(this).change(changeRole);
  })
  $("td a").each(function() {
    var action = $(this).attr("id").split("#")[2] || '';
    if(action === "delete") {
      $(this).click(deleteCoop);
    } else if(action === "agree") {
      $(this).click(agreeCoop);
    } else {
      $(this).click(refuseCoop);
    }
  });
}

//发出邀请
function submitInvite() {
  var email = $("#inviteEmail").val() || '';
  var words = $("#inviteWords").val() || '';
  var role = $("#roles").val() || '';
  var url = $("form").attr('action') || '';
  var regEmail = /^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/;
  if(!regEmail.exec(email)) {
    sAlert("警告", "请输入合法的email地址");
    return false;
  }
  $.ajax({
    cache : false,
    type : "POST",
    url : url,
    dataType : "json",
    data : {
      inviteEmail : email,
      inviteWords : words,
      role : role
    },
    error : function() {
      sAlert("警告", "没有权限进行此操作");
    },
    success : function(data) {
      if(data.status === "error")
        sAlert("警告", data.msg);
      else {
        sAlert("", "邀请已成功发送！");
        var role = data.role;
        var html = '<tr id="' + email + 'Tr"><td>' + email + '</td><td>inactive</td><td>' + '<a href="javascript:void(0);" id="' + email + "#" + data.domain + '#delete">删除此参与者</a></td><td>' + '<select id="' + email + 'Role">' + '<option value="1"';
        if(data.role == 1)
          html += " selected";
        html += '>管理者</option><option value="2"';
        if(data.role == 2)
          html += " selected";
        html += '>参与者</option><option value="3"';
        if(data.role == 3)
          html += " selected";
        html += '>观察者</option></select></td></tr>';
        $("#allCoops").html($("#allCoops").html() + html);
        bindCoop();
      }
    }
  });
  return false;
}

//删除成员
function deleteCoop() {
  str = '删除用户将清空该用户对这个应用的一切数据，确定要删除吗？';
  if(!confirm(str))
    return false;
  var infos = $(this).attr("id").split("#");
  if(infos.length != 3) {
    return false;
  }
  $.ajax({
    cache : false,
    type : "POST",
    url : "/application/mamage/" + infos[1] + "/deleteCoop",
    dataType : "json",
    data : {
      email : infos[0]
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试！");
    },
    success : function(data) {
      if(data.status === 'error')
        sAlert("警告", data.msg);
      else {
        var deleteNode = document.getElementById(infos[0] + "Tr");
        deleteNode.parentNode.removeChild(deleteNode);
      }
    }
  });
}

function agreeCoop() {
  var action = $(this);
  var infos = action.attr("id").split("#");
  if(infos.length != 3) {
    return false;
  }
  $.ajax({
    cache : false,
    type : "POST",
    url : "/application/mamage/" + infos[1] + "/agreeCoop",
    dataType : "json",
    data : {
      email : infos[0]
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试！");
    },
    success : function(data) {
      if(data.status === 'error')
        sAlert("警告", data.msg);
      else {
        sAlert("", "操作成功，请修改申请者权限");
        //location.reload();
        var memInfo = action.parent().parent().children();
        if(memInfo.length !== 4) {
          alert(memInfo.html());
          return location.reload();
        }
        memInfo[1].innerHTML = "active";
        memInfo[2].innerHTML = '<a href="javascript:void(0);" id="' + infos[0] + "#" + infos[1] + '#delete">删除此参与者</a>';
        memInfo[3].innerHTML = '<select id="' + infos[0] + 'Role">' + '<option value="1">管理者</option>' + '<option value="2">参与者</option>' + '<option value="3" selected>观察者</option></select>';
        bindCoop();
      }
    }
  });
}

function refuseCoop() {
  var reason = "";
  if(null === ( reason = prompt("拒绝原因：", ""))) {
    return false;
  }
  var action = $(this);
  var infos = action.attr("id").split("#");
  if(infos.length != 3) {
    return false;
  }
  $.ajax({
    cache : false,
    type : "POST",
    url : "/application/mamage/" + infos[1] + "/refuseCoop",
    dataType : "json",
    data : {
      email : infos[0],
      reason : reason
    },
    error : function() {
      sAlert("警告", "连接错误，请稍后再试！");
    },
    success : function(data) {
      if(data.status === 'error')
        sAlert("警告", data.msg);
      else {
        var deleteNode = document.getElementById(infos[0] + "Tr");
        deleteNode.parentNode.removeChild(deleteNode);
      }
    }
  });
}

function changeRole() {
  var newRole = this.options[this.options.selectedIndex].value, email = $(this).attr("id").slice(0, -4);
  $.ajax({
    cache : false,
    type : "POST",
    url : "/application/manage/" + domain + "/changeRole",
    dataType : "json",
    data : {
      role : newRole,
      email : email
    },
    error : function() {
      sAlert("警告", "修改权限失败，请稍后再试");
    },
    success : function(data) {
      if(data.done) {
        sAlert("", "修改权限成功");
      } else {
        sAlert("警告", data.msg);
      }
    }
  })
}