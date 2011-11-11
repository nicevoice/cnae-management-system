var onStdErr=false, onStdOut=false;
var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function(){
  mouseOnStdDiv();
	window.setTimeout(function(){	
		getOutput("stdout");					
	}, 10);
	window.setTimeout(function(){
		getOutput("stderr");
	}, 10);	
})

function getOutput(action){
  $.ajax({
    cache: false,
    type: "post",
    url: "/application/manage/" + domain + "/getStdOutput",
    dataType: "json",
    data: {
      action: action
    },
    error: function(){
      $("#" + action).html(action + "获取失败");
      window.setTimeout(function(){ //如果ajax失败，则在30秒后才会再去读取
        getOutput(action);
      }, 30000);
    },
    success: function(data){
      res = htmlSpecial(data.output);
      res = getColor(res);
      $("#" + action).html(res);
      window.setTimeout(function(){
        getOutput(action);
      }, 10000);
      var pOnDiv;
      if (action === "stdout") {
        pOnDiv = onStdOut;
      }
      else {
        pOnDiv = onStdErr;
      }
      if (!pOnDiv) {
        if (!document.getElementById) 
          return;
        var outDiv = document.getElementById(action);
        outDiv.scrollTop = outDiv.scrollHeight;
      }
    }
  });
}

//绑定鼠标进出std DIV的事件
function mouseOnStdDiv(){
  $("#stdout").mouseenter(function(){
    onStdOut = true;
  });
  $("#stderr").mouseenter(function(){
    onStdErr = true;
  });
   $("#stdout").mouseleave(function(){
    onStdOut = false;
  });
   $("#stderr").mouseleave(function(){
    onStdErr = false;
  }) 
}