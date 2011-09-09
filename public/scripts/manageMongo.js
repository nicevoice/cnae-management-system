$(function(){
	$.ajax({
	cache:false,
	url:"/getOwnAuthInfo",
	type:"post",
	dataType:"json",
	data:{domain:$("#appDomain").html()},
	error:function(){
		$("#queryDb").click(queryDb);
	},
	success:function(data){
		if(data.active===0 || data.role>1){//如果不是管理者或者创建者
			$("#createDb").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
			$("#queryDb").click(function(){sAlert("警告","没有权限进行此操作"); return false;});
		}else{
			$("#queryDb").click(queryDb);
		}
	}
	});
	$("#queryString").keydown(function(e){
		if(e.keyCode===13){
			queryDb();
		}
	});
})
checkQueryString = function(queryString){
  if(queryString.indexOf("db.")!==0 || queryString.indexof("show")!==0){
    return false;
  }else{
    if(queryString.indexOf("db.addUser")===0||
       queryString.indexOf("db.auth")===0||
       queryString.indexOf("db.removeUser")===0||
       queryString.indexOf("db.eval")===0||
       queryString.indexOf("db.dropDatabase")===0||
       queryString.indexOf("db.shoutdownServer")===0||
       queryString.indexOf("db.copyDatabase")===0||
       queryString.indexOf("db.cloneDatabse")===0){
         return false;
       }else{
         return true;
       }
  }
}

queryDb = function(){
	var domain = $("#appDomain").html();
	var queryString = $("#queryString").val().trim()||'';
	if(!queryString){
		return false;
	}
	if(!checkQueryString(queryString)){
    $("#queryOutput").html("该操作不被允许");
		return false;	
	}
	$.ajax({
	cache:false,
	url:"/application/manage/"+domain+"/queryMongo",
	type:"post",
	dataType:"json",
	data:{queryString:queryString},
	error:function(){
		sAlert("警告","连接错误，请稍后再试");
	},
	success:function(data){
		$("#queryOutput").html(data.output);
	}
	})
}