var appNums = 0,
    onceNum = 20;
$(function(){
  getMore();
  $("#getMore").click(getMore);
})

function getMore(){
  $("#getMore").html("加载中...");
  $.get("/suqare/post",
        {skip:appNums, limit:onceNum},
        function(data){
          $("#square-apps").html($("#square-apps").html()+data);  
          $("#getMore").html("更多");
        },
        "text");  
}
