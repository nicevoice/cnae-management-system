$(function(){

	$.ajax({
	cache:false,
	url:"/getOwnAuthInfo",
	type:"post",
	dataType:"json",
	data:{domain:$("#appDomain").html()},
	error:function(){
			$("#submitUpload").click(upload);
			$("#download").click(download);;
      $("#gitPull").click(pull);
      $("#gitClone").click(clone);     
      $("#gitUrl").keydown(function(e){
		    if(e.keyCode===13){
		  	  clone();
		    }
  	  })
	},
	success:function(data){
		if(data.active===0 || data.role>2){//如果是观察者
			$("#submitUpload").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
			$("#download").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
      $("#gitClone").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
      $("#gitPull").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
		}else{
			$("#submitUpload").click(upload);
			$("#download").click(download);
      $("#gitPull").click(pull);
      $("#gitClone").click(clone);
      $("#gitUrl").keydown(function(e){
		    if(e.keyCode===13){
		  	  clone();
		    }
  	  })
		}
	}
	});
});

upload = function(){
  var str = '可能会覆盖之前存在的代码，确定上传吗？';
	if(!confirm(str))
		return false;
	var file = $("#getFile").val();
	if(!file){
		sAlert("警告", "请选择要上传的文件");
		return false;
	}
	var type = file.slice(file.lastIndexOf('.')+1);
	if(!(type==='gz'||type==='zip')){
		sAlert("警告", "请上传正确的格式");
		return false;
	}
	$("#uploading").css("display", "block");
}
download = function(){
	var domain = $("#appDomain").html();
	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/download",
	dataType:"json",
	data:{},
	error:function(err){
		sAlert("警告", "连接错误，请稍后再试");
	},
	success:function(data){
		
		if(data.status==="ok"){
			var a = $("<a href='"+ data.url +"' target='_blank'>download</a>").get(0);
            var e = document.createEvent('MouseEvents');
            e.initEvent( 'click', true, true );
            a.dispatchEvent(e);
		}else{
			sAlert("警告", "发生错误，请稍后再试");
		}
	}
	})
}

clone = function(){
  var gitUrl = $("#gitUrl").val()||'',
      domain = $("#appDomain").html();
  if(gitUrl === ""){
    return false;
  }
  var str = '可能会覆盖之前存在的代码，确定进行此操作吗？';
	if(!confirm(str))
		return false;
 	$.ajax({
	cache:false,
	type:"post",
	url:"/application/manage/"+domain+"/clone",
	dataType:"json",
	data:{gitUrl:gitUrl},
	error:function(err){
		 showInfo("连接错误,请稍后再试。");
	},
	success:function(data){
		if(data.status==="ok"){
      showInfo("代码获取成功");
		}else{
			 showInfo("连接错误,请稍后再试。");
		}
	}
	})
}

pull = function(){
  
}

showInfo = function(msg){
  msg = htmlSpecial(msg);
  alert($("#info"));
  if ($("#info")) {
    $("#info").html = msg;
  }
  else{
    var info = $('<pre id="info" class="borderRadius5"></pre>');
    info.html = msg;
    info.insertAfter($("#pull-p"));
  }
}
