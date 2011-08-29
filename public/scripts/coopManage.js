$(function(){
	$("#submitInvite").click(submitInvite);
		$.ajax({
		cache:false,
		url:"/getOwnAuthInfo",
		type:"post",
		dataType:"json",
		data:{domain:$("#appDomain").html()},
		error:function(){},
		success:function(data){
			if(data.active===0 || data.role>0){//如果不是创建者
				$("#submitInvite").attr("disabled","true");
			}
		}
	});
	$("td a").each(function() {
		$(this).click(deleteCoop);
	});
	$("td select").each(function(){
		$(this).change(changeRole);
	})
});
//发出邀请
function submitInvite(){
	var email = $("#inviteEmail").val();
	var words = $("#inviteWords").val();
	var role = $("#roles").val();
	var url = $("form").attr('action');
	$.ajax({
    cache:false,
    type:"POST",
    url:url,
    dataType:"json",
    data:{inviteEmail:email, inviteWords:words, role:role},
    error:function(){
      sAlert("警告","没有权限进行此操作");
    },
    success:function(data){
      if(data.done===false)
        sAlert("警告",data.why);
      else{
      	sAlert("","邀请已成功发送！");
	    var role = data.role;
      	var html = '<tr id="'+email+'Tr"><td>'+email+'</td><td>inactive</td><td>'+
      	'<a href="javascript:void(0);" id="' + email +
      	"#"+data.domain+'">删除此参与者</a></td><td>'+
      	'<select id="'+email+'Role">'+
        '<option value="1"';
        if(data.role==1) html += " selected";
        html += '>管理者</option><option value="2"';
        if(data.role==2) html += " selected";		
        html += '>参与者</option><option value="3"';
        if(data.role==3) html += " selected";
        html+='>观察者</option></select></td></tr>';
      	$(html).insertAfter("tr:last");
      	$("tr:last a").click(deleteCoop);
      	}
   	}
});
	return false;
}
//删除成员
function deleteCoop(){
	str = '删除用户将清空该用户对这个应用的一切数据，确定要删除吗？';
	if(!confirm(str))
		return false;
	var infos = $(this).attr("id").split("#");
	if(infos.length!=2) {
		return false;
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/application/mamage/"+ infos[1] +"/deleteCoop",
    dataType:"json",
    data:{email:infos[0]},
    error:function(){
      sAlert("警告","连接错误，请稍后再试！");
    },
    success:function(data){
      if(data.done===false)
        sAlert("警告","连接错误，请稍后再试");
      else{
      	  var deleteNode = document.getElementById(infos[0]+"Tr");
	      deleteNode.parentNode.removeChild(deleteNode);
      }
   	}
});	
}

function changeRole(){
	var newRole = this.options[this.options.selectedIndex].value,
		email = $(this).attr("id").slice(0, -4),
		domain = $("#appDomain").html();
	$.ajax({
		cache:false,
		type:"POST",
		url:"/application/manage/"+domain+"/changeRole",
		dataType:"json",
		data:{role:newRole, email:email},
		error:function(){
			sAlert("警告","修改权限失败，请稍后再试");
		},
		success:function(data){
			if(data.done){
				sAlert("","修改权限成功");
			}else{
				sAlert("警告","修改权限失败，请稍后再试");
			}
		}
	})
}