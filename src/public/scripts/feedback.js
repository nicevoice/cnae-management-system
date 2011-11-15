$(function(){
	$('#fbSubmit').click(fbSubmit);
});
function fbSubmit(){
	var title = $("#fbTitle").val()||'';
	var contents = $("#fbContent").val()||'';
	if(!title) {
		sAlert("警告","请输入邮件标题");
		return false;
	}
$.ajax({
    cache:false,
    type:"POST",
    url:"/feedBack",
    dataType:"json",
    data:{title:title, content:contents},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
      sAlert("","反馈已提交，感谢您的建议！");
      	}
   	}
});	
return false;
}