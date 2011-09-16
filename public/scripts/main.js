$(function() {
	$('div .application').each(function(index) {
		$(this).mouseenter(function() {
			$('span:eq(' + index + ')').css("display", "block");
			});
			$(this).mouseleave(function() {
			$('span:eq(' + index + ')').css("display", "none");
			});
	});
});

//删除自己的应用
function delApp(domain){
	str = '删除应用将清空对应的一切数据，确定要删除吗？';
	if(!confirm(str))
		return false;
 $.ajax({
    cache:false,
    type:"POST",
    url:"/delete",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.id==-1)
        sAlert("警告","连接错误，请稍后再试");
      else{
	      var deleteDiv = document.getElementById(domain+"-div");
	      deleteDiv.parentNode.removeChild(deleteDiv);
	      var appNums = 0;
		  $('div .application').each(function(index) {
		  		appNums++;
				$(this).unbind("mouseenter").unbind("mouseleave");
				$(this).mouseenter(function() {
				$('span:eq(' + index + ')').css("display", "block");
				});
				$(this).mouseleave(function() {
				$('span:eq(' + index + ')').css("display", "none");
				});
			});
		 	$('#createApp li').html('<a href="/application/newApp">创建新应用('+appNums+'/10)');
		 
      	}
   	}
});
}

function active(domain){
$.ajax({
    cache:false,
    type:"POST",
    url:"/join",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      alert("ajax error");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
		$("#coop-"+domain + " img").attr('src', '/images/arrow.gif');
      	$("#active-"+domain).css("display", "none");
      	$("#inactived"+domain).removeClass("inactiveApp");
      	}
   	}
});	
}

function delCoopApp(domain){
str = '退出项目将清空对应的一切数据，确定要退出吗？';
if(!confirm(str))
	return false;
$.ajax({
    cache:false,
    type:"POST",
    url:"/deleteCoop",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
	      var deleteNode = document.getElementById("coop-"+domain);
	      deleteNode.parentNode.removeChild(deleteNode);
	      	$('div .otherApp').each(function(index) {
			$(this).unbind("mouseenter").unbind("mouseleave");
			$(this).mouseenter(function() {
			$('.otherApp span:eq(' + index + ')').css("display", "block");
			});
			$(this).mouseleave(function() {
			$('.otherApp span:eq(' + index + ')').css("display", "none");
			});
	});
      	}
   	}
});	
}

