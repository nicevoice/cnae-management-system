var validator = new Validator();
var tagD = false, tagN = false, tagG = true, tagI = true;
$(function(){
	$("#appDomain").blur(domainBlur).focus(domainFocus);
	$("#appName").blur(nameBlur).focus(nameFocus);
    $("#github").blur(githubBlur).focus(githubFocus);
    $("#appImage").blur(imgBlur).focus(imgFocus);
    if($("#domainWarn").html().indexOf("域名")!==-1){
        $("#domainWarn").addClass('warnColor');
    }
    $('#newAppSubmit').click(newApp);
    $('input').filter(function(index){
        return ($(this).attr('type') === 'text');
    }).each(function(){
        enterDown($(this), newApp);
    })
});
domainBlur = function(){
	var domain = $("#appDomain").val().trim()||'';
	$("#appName").val(domain);
  if(!domain){
    tagD = false;
    tagN = false;
    return $("#domainWarn").addClass("warnColor").html(" 域名格式不正确");
  }
  if(!validator.verify('domain', domain)){
    tagD = false;
		return $("#domainWarn").addClass("warnColor").html(" 域名格式不正确");
  }
	$.ajax({
    cache:false,
    type:"get",
    url:"/checkAppDomain",
    dataType:"json",
    data:{domain:domain},
    error:function(){},
    success:function(data){
        if(data.warn){
            tagD = false;
            $("#domainWarn").addClass("warnColor").html(data.warn); 
        }
    }
	});		
}	
domainFocus = function(){
  tagD = true;
  tagN = true;
	$("#domainWarn").removeClass("warnColor").html($("#topDomain").html());
}
nameBlur = function(){
	var name = $("#appName").val().trim()||'';
    if(!name){
        tagN = false;
        return $("#appNameWarn").html("必须有应用名");
    }
    if(name.length>20){
        tagN = false;
	 	return $("#appNameWarn").html("必须小于20个字符");
    }
}	
nameFocus = function(){
    tagN = true;
	  $("#appNameWarn").html("");
}
githubFocus = function(){
    tagG = true;
    $("#githubWarn").html("");
}
githubBlur = function(){
    var github = $("#github").val().trim()||'';
    if(github&&!validator.verify('githubPage', github)){
        tagG = false;
        $("#githubWarn").html("github地址不正确");    
    }
}
imgFocus = function(){
    tagI = true;
        $("#imgWarn").html("");
}
imgBlur = function(){
    var img = $("#appImage").val().trim()||'';
    if(img&&!validator.verify('imgSource', img)){
        tagI = false;
        $("#imgWarn").html("图片地址不正确");    
    }
}

function newApp(){
    if(!tagD||!tagN||!tagG||!tagI){
        return false;
    }
    $.post('/createApp', {
        appDomain : $('#appDomain').val(),
        appName : $('#appName').val(),
        github : $('#github').val(),
        appImage : $('#appImage').val(),
        appDes : $('#appDes').val(),
        _csrf : $('#_csrf').val()
    }, fillWarn, 'json');  
}

function fillWarn(data){
    if(data.status!=='ok'){
        switch(data.warn){
            case 'domainErr' : $("#domainWarn").addClass("warnColor").html(" 域名格式不正确"); break;
            case 'domainRep' : $("#domainWarn").addClass("warnColor").html("域名已经被使用"); break;
            case 'domainLimit' : $("#domainWarn").addClass("warnColor").html("创建应用数目达到上限"); break;
            case 'noName' : $("#appNameWarn").html("必须有应用名"); break;
            case 'githubErr' : $("#githubWarn").html("github地址不正确");break;
            case 'imgErr' : $("#imgWarn").html("图片地址不正确");  break;        }
    }else{
        window.location.href = '/application';
    }    
}