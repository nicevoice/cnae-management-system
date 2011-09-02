$(function(){
	$("#sendInviteByEmail").hide();
	$("#generateInviteCode").click(generate);
	$("#sendInviteCode").click(sendInvite);
	pagination();
})
function pagination(){
	var url = window.location.href;
	var prev = $("li.prev"), next = $("li.next");
	if(!url.split("?")[1]){
		$("div .pagination li:eq(1)").addClass("active");
			}
		else{
			var thisPage = url.slice(url.lastIndexOf("/"));
			$("div .pagination li").each(function(){
				var tempRef = $(this).children("a").attr("href");
				var tempPage = tempRef.slice(tempRef.lastIndexOf('/'));

				if(thisPage==tempPage){
					$(this).addClass("active");
				}
			});
		}
	var here = $("li.active");
	var temps=here.children("a").attr("href").split("=");
	var page = parseInt(temps[1]);
	var head = temps[0];
	if(page===1){
		prev.addClass("disabled").click(function(){return false;});
	}else{
		prev.children("a").attr("href",temps[0]+"="+(page-1));	
	}
	next.children("a").attr("href",temps[0]+"="+(page+1));
	var sLastClass = $("div .pagination li").eq("-2").attr("class");
	if(sLastClass && sLastClass.indexOf("active")!=-1){
		next.addClass("disabled").click(function(){return false;});
	}
}

function generate(){
	$.ajax({
	cache:false,
	type:"post",
	url:"/inviteCode",
    dataType:"json",
    data:{},
	error:function(){
		sAlert("警告","ajax错误，请稍后再试");
	},
	success:function(data){
		if(data.done===false){
			sAlert("警告","生成错误，请稍后再试");
		}else{
		$("#inviteCode").html($("#inviteCode").attr("class")+data.code);
		$("#sendInviteByEmail").show();
		}
	}
	});
}

function sendInvite(){
	var code = $("#inviteCode").html(),
		email  =$("#email").val()||'';
	if(code==="请点击生成按钮"){
		sAlert("警告","请先生成邀请码！");
		return false; 
	}
	var regEmail = /^[a-zA-Z0-9_/./-]+@(\w+).(\w){2,4}$/;
	if(!regEmail.exec(email)){
		sAlert("警告","请输入合法的email地址");
		return false;
	}
	$.ajax({
    cache:false,
    type:"POST",
    url:"/sendInviteCode",
    dataType:"json",
    data:{email:email,code:code},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告",data.warn);
      else{
		$("#sendInviteByEmail").hide();    	
      	sAlert("","邀请码已发送");
      }
   	}
});	
}

function sendThisInvite(which){
	var id = $(which).attr("id")||'';
	if(!id) return false;
	var code = id.split("&")[1];
	if(!code) return false;
	$("#inviteCode").html(code);
	$("#sendInviteByEmail").show();	
}

function deleteInvite(which){
	str = '确定要删除该邀请码么？';
	if(!confirm(str))
		return false;
	var id = $(which).attr("id")||'';
	if(!id) return false;
	var code = id.split("&")[1];
	if(!code) return false;
	$.ajax({
    cache:false,
    type:"POST",
    url:"/deleteInviteCode",
    dataType:"json",
	data:{code:code},
	err:function(){
		sAlert("警告", "删除失败，请稍后再试");
	},
	success:function(data){
		if(data.done===true){
			location.reload(false);
		}
	}
	
	})
}
