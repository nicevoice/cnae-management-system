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
});

doFinish = function(which){
  alert(which.attr("id"));
  var _id = which.attr("id") || '', domain = $("#appDomain").html() || '';
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
  alert(which.attr("id"));
  var _id = which.attr("id") || '', domain = $("#appDomain").html() || '';
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
