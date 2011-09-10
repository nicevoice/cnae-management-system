var domain = $("#appDomain").html() || '';
$(function(){
  $(".doFinish").each(function() {
    $(this).click(function(){
      doFinish($(this));
      });
  });
  $(".doRecover").each(function(){
    $(this).click(function(){
      doRecover($(this));
      });
  });
  $(".doDelete").each(function(){
    $(this).click(function(){
      doDelete($(this));
      });
  });
  $("#submitTodo").click(check);
});
check = function(){
  if($("#titleContent").val()===""){
    return false;
  }
}
doFinish = function(which){
  var _id = which.attr("id") || '';
  $.ajax({
    cache: false,
    type: "post",
    url: "/application/manage/" + domain + "/todo/finish",
    dataType: "json",
    data: {
      _id: _id
    },
    error: function(){
        sAlert("警告", "执行错误，请稍后再试");
    },
    success: function(data){
      if (data.status === "ok") {
        location.reload(true);
      }else{
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}

doRecover = function(which){
  var _id = which.attr("id") || '';
  $.ajax({
    cache: false,
    type: "post",
    url: "/application/manage/" + domain + "/todo/recover",
    dataType: "json",
    data: {
      _id: _id
    },
    error: function(){
        sAlert("警告", "执行错误，请稍后再试");
    },
    success: function(data){
      if (data.status === "ok") {
        location.reload(true);
      }else{
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}
doDelete = function(which){
  var _id = which.prev().prev().attr("id")||'';
  $.ajax({
    cache: false,
    type: "post",
    url: "/application/manage/" + domain + "/todo/delete",
    dataType: "json",
    data: {
      _id: _id
    },
    error: function(){
        sAlert("警告", "执行错误，请稍后再试");
    },
    success: function(data){
      if (data.status === "ok") {
        location.reload(true);
      }else{
        sAlert("警告", "执行错误，请稍后再试");
      }
    }
  })
}
