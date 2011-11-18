$(function(){
	$("#appDomain").blur(domainBlur).focus(domainFocus);
	$("#appName").blur(nameBlur).focus(nameFocus);
});
domainBlur = function(){
	var domain = $("#appDomain").val()||'';
	$("#appName").val(domain);
	var regDomain = /^[a-z][a-z0-9_]{3,19}$/;
  	if(!regDomain.exec(domain))
		return $("#domainWarn").html("域名格式不正确");
	$.ajax({
    cache:false,
    type:"POST",
    url:"/checkAppDomain",
    dataType:"json",
    data:{domain:domain},
    error:function(){},
    success:function(data){
     $("#domainWarn").html(data.warn); 
    }
	});		
}
	
domainFocus = function(){
	$("#domainWarn").html("");
	$("#newWarn").html("");
}

nameBlur = function(){
	var name = $("#appName").val()||'';
  	if(name.length>20)
		return $("#appNameWarn").html("应用名不能超过20个字");
}
	
nameFocus = function(){
	$("#appNameWarn").html("");
    $("#newWarn").html("");
}