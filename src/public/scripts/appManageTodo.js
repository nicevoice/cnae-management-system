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
var tplTodos = '<div class="post subContent">'+
               '<form action="/application/manage/$domain$/todo/new" method="post" id="post_new">'+
               '<input type="hidden" name="_csrf" value="'+ _csrf +'">'+
               '<p> <input type="text" id="titleContent" name="title" class="longInput" /></p>'+
               '</form></div>'+
               '<div class="todos"><ul>$todos$</ul></div>',
     tplFinished = '<span style="width:400px"><li class="finished">'+
               '<img src="/images/ok.gif"></img> $nickName$ : <del>$title$</del><span class="todoAction">'+
               '<a href="javascript:void(0)" id="$email$#$title$" class="doRecover">恢复</a>'+
               ' , <a href="javascript:void(0)" class="doDelete">删除</a></span></li>';
     tplNotFinished = '<li>'+
               '$nickName$ : $title$ <span class="todoAction">'+
               '<a href="javascript:void(0)" id="$email$#$title$" class="doFinish">完成</a>'+
               ' , <a href="javascript:void(0)" class="doDelete">删除</a></span></li>';
function renderTodoContent(todos){
    var todoContent = "";
    for(var i=0, len=todos.length; i!=len; ++i){
        var todo = todos[i];
        todo.title = htmlSpecial(todo.title);
        if(todo.finished===0){
            todoContent += tplReplace(tplNotFinished, {
                '$nickName$':todo.nickName,
                '$title$':todo.title,
                '$email$':todo.email
            });
        }else{
            todoContent += tplReplace(tplFinished, {
                '$nickName$':todo.nickName,
                '$title$':todo.title,
                '$email$':todo.email
            })
        } 
    }
    $('#todo-content').html(tplReplace(tplTodos, {
        '$domain$':domain,
        '$todos$':todoContent
    }));
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
    type : "get",
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
      title : title,
      _csrf:_csrf
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
      title : title,
      _csrf:_csrf
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
      title : title,
      _csrf:_csrf
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