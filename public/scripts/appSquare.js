var appNums = 0,
    onceNum = 20;
$(function(){
  getMore();
  $("#getMore").click(getMore);
})

function getMore(){
  $("#getMore").html("加载中...");
  $.ajax({
    cache:false,
    type:"get",
    url:"/square/post",
    data:{skip:appNums, limit:onceNum},
    error:function(){
      $("#getMore").html("获取失败，请稍后再试");
    },
    success:function(data){
      render(data);  
      $("#getMore").html("更多");
      appNums += onceNum;
    }
  });
}
function render(data){
  $("#square-apps").html($("#square-apps").html()+data.msg);
}
