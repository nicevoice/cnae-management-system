var validator = new Validator();
$(function(){
	$("#appDomain").blur(domainBlur).focus(domainFocus);
	$("#appName").blur(nameBlur).focus(nameFocus);
  $("#github").blur(githubBlur).focus(githubFocus);
  $("#appImage").blur(imgBlur).focus(imgFocus);
  if($("#domainWarn").html().indexOf("域名")!==-1){
    $("#domainWarn").addClass('warnColor');
  }
});
domainBlur = function(){
	var domain = $("#appDomain").val().trim()||'';
	$("#appName").val(domain);
  	if(!validator.verify('domain', domain))
		return $("#domainWarn").addClass("warnColor").html(" 域名格式不正确");
	$.ajax({
    cache:false,
    type:"POST",
    url:"/checkAppDomain",
    dataType:"json",
    data:{domain:domain},
    error:function(){},
    success:function(data){
     $("#domainWarn").addClass("warnColor").html(data.warn); 
    }
	});		
}	
domainFocus = function(){
	$("#domainWarn").removeClass("warnColor").html($("#topDomain").html());
}
nameBlur = function(){
	var name = $("#appName").val().trim()||'';
  	if(name.length>20)
		return $("#appNameWarn").html("必须小于20个字符");
}	
nameFocus = function(){
	$("#appNameWarn").html("");
}
githubFocus = function(){
    $("#githubWarn").html("");
}
githubBlur = function(){
    var github = $("#github").val().trim()||'';
    if(github&&!validator.verify('githubPage', github)){
        $("#githubWarn").html("github地址不正确");    
    }
}
imgFocus = function(){
    $("#imgWarn").html("");
}
imgBlur = function(){
    var img = $("#appImage").val().trim()||'';
    if(img&&!validator.verify('imgSource', img)){
        $("#imgWarn").html("图片地址不正确");    
    }
}
