var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
tips = "输入待办事项，按回车确认";
$(function() {
  loadTodoContent();
});
function loadTodoContent() {
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_todo",
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderTodoContent(data.content.todos);
        prepare();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderTodoContent(todos) {
  var length = todos.length, html = '<div class="post subContent">' + '<form action="/application/manage/' + domain + '/todo/new" method="post" id="post_new">' + '<p> <input type="text" id="titleContent" name="title" class="longInput" /></p></form></div>' + '<div class="todos"><ul>';
  for(var i = 0; i != length; ++i) {
    var todo = todos[i];
    var status = todo.finished == 1 ? 'class="finished"' : '';
    html += '<li ' + status + '>';
    if(todo.finished === 0) {
      html += todo.nickName + '&nbsp;:' + todo.title + '<span class="todoAction"><a href="javascript:void(0)" id="' + todo.email + '#' + todo.title + '" + class="doFinish">完成</a>';
    } else {
      html += '<img src="/images/ok.gif"></img>' + todo.nickName + '&nbsp;:<del>' + todo.title + '</del>' + '<span class = "todoAction"><a href="javascript:void(0)" id="' + todo.email + '#' + todo.title + '" class="doRecover">恢复</a>';
    }
    html += ' , <a href="javascript:void(0)" class="doDelete">删除</a></span></li>';
  }
  html += '</ul></div>';
  $("#todo-content").html(html);
}

function prepare() {
  $(".todos li").each(function(index) {
    $(this).mouseenter(function() {
      $('.todos span:eq(' + index + ')').css("display", "block");
    });
    $(this).mouseleave(function() {
      $('.todos span:eq(' + index + ')').css("display", "none");
    });
  });
  addTips();
  $("#titleContent").blur(addTips).focus(removeTips);
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "post",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function() {
      bindAll();
    },
    success : function(data) {
      if(data.active === 0 || data.role > 2) {
        bindNo();
      } else {
        bindAll();
      }
    }
  });
}

function bindAll() {
  $(".doFinish").each(function() {
    $(this).click(function() {
      doFinish($(this));
    });
  });
  $(".doRecover").each(function() {
    $(this).click(function() {
      doRecover($(this));
    });
  });
  $(".doDelete").each(function() {
    $(this).click(function() {
      doDelete($(this));
    });
  });
  $("#submitTodo").click(check);
  $("#titleContent").keydown(function(e) {
    var val = $("#titleContent").val() || '';
    if(e.keyCode === 13 && val === '' || val === tips) {
      return false;
    }
  })
}

function bindNo() {
  $(".doFinish").each(function() {
    $(this).click(function() {sAlert("警告", "没有权限进行此操作");
      return false;
    });
  });
  $(".doRecover").each(function() {
    $(this).click(function() {sAlert("警告", "没有权限进行此操作");
      return false;
    });
  });
  $(".doDelete").each(function() {
    $(this).click(function() {sAlert("警告", "没有权限进行此操作");
      return false;
    });
  });
  $("#submitTodo").click(function() {sAlert("警告", "没有权限进行此操作");
    return false;
  });
  $("#titleContent").keydown(function(e) {
    if(e.keyCode === 13) {
      return false;
    }
  })
}

function addTips() {
  var title = $("#titleContent"), titleContent = title.val() || '';
  if(titleContent === '') {
    title.val(tips);
  }
}

function removeTips() {
  var title = $("#titleContent");
  if(title.val() === tips)
    title.val("");
}

check = function() {
  if($("#titleContent").val() === "") {
    return false;
  }
}
doFinish = function(which) {
  var infos = which.attr("id").split("#"), email = infos[0] || '', title = infos[1] || '';
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/todo/finish",
    dataType : "json",
    data : {
      email : email,
      title : title
    },
    error : function() {
      sAlert("警告", "执行错误，请稍后再试");
    },
    success : function(data) {
      if(data.status === "ok") {
        location.reload(true);
      } else {
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}
doRecover = function(which) {
  var infos = which.attr("id").split("#"), email = infos[0] || '', title = infos[1] || '';
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/todo/recover",
    dataType : "json",
    data : {
      email : email,
      title : title
    },
    error : function() {
      sAlert("警告", "执行错误，请稍后再试");
    },
    success : function(data) {
      if(data.status === "ok") {
        location.reload(true);
      } else {
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}
doDelete = function(which) {
  var infos = which.prev().attr("id").split("#"), email = infos[0] || '', title = infos[1] || '';
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/todo/delete",
    dataType : "json",
    data : {
      email : email,
      title : title
    },
    error : function() {
      sAlert("警告", "执行错误，请稍后再试");
    },
    success : function(data) {
      if(data.status === "ok") {
        location.reload(true);
      } else {
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}