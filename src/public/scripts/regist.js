var validator = new Validator();
var tagE=false, tagN=false, tagP=false, tagC=false;
$(function(){
    $("#newEmail").blur(emailBlur).focus(emailFocus);
    $("#newUserName").blur(nameBlur).focus(nameFocus);
    $("#newPassword").blur(passBlur).focus(passFocus);
    $("#passwordCon").blur(conBlur).focus(conFocus);
    $("#submit").click(submit);
});
emailBlur = function(){
    var email = $("#newEmail").val()||'';
    if(!validator.verify('email', email)){
        $("#emailWarn").html("请输入合法的email地址"); 
        tagE=false;
        return false;
    }
    $.ajax({
    cache:false,
    type:"GET",
    url:"/regist/checkEmail",
    dataType:"json",
    data:{email:email},
    error:function(){},
    success:function(data){
        if(data.warn){
            $("#emailWarn").html(data.warn); 
            tagE = false;
        }
    }
    });
}
emailFocus = function(){
    $("#emailWarn").html("");
    tagE = true;
}

nameBlur = function(){
    var name = $("#newUserName").val()||'';
    if(!name){
        $("#nameWarn").html("必须输入昵称"); 
        tagN = false;
    }
    if(!validator.verify('name', name)){
        $("#nameWarn").html("昵称中不能包含特殊字符"); 
        tagN = false;
    }
    $.ajax({
    cache:false,
    type:"GET",
    url:"/regist/checkName",
    dataType:"json",
    data:{name:name},
    error:function(){},
    success:function(data){
        if(data&&data.warn){
            $("#nameWarn").html(data.warn);
            tagN = false;
        }
    }
    });
}
nameFocus = function(){
    $("#nameWarn").html("");
    tagN = true;
}


passBlur = function(){
    var password = $("#newPassword").val()||'';
    if(!validator.verify('password', password)){
        $("#passwordWarn").html("密码不能小于6位"); 
        tagP = false;
    }else{
        var con = $("#passwordCon").val()||'';
        if(con && password!==con){
            $("#conWarn").html("两次密码必须一致");
            tagC = false;    
        }else{
            conFocus();
        }
    }
}
passFocus = function(){
    $("#passwordWarn").html("");
    tagP = true;
    tagC = true;
}

conBlur = function(){
    var password = $("#newPassword").val()||'';
    var con = $("#passwordCon").val()||'';
    if(password!==con){
            $("#conWarn").html("两次密码必须一致");     
            tagC = false;
        }
}
conFocus = function(){
    $("#conWarn").html("");
    tagC = true;
}
function submit(){
    if(!tagE||!tagN||!tagP||!tagC){
        return false;
    }
/*
    $.post('/checkRegist', {
        newEmail : $('#newEmail').val(),
        newUserName : $('#newUserName').val(),
        newPassword : $('#newPassword').val(),
        passwordCon : $('#passwordCon').val(),
        inviteCode : $('#inviteCode').val(),
        _csrf : $('#_csrf').val()
    }, fillWarn, 'json');*/
}
function fillWarn(data){
    if(data.status!=='ok'){
        switch(data.warn){
            case 'eamilErr' : $("#emailWarn").html("请输入合法的email地址"); break;
            case 'noNick' : $("#nameWarn").html("必须输入昵称"); break;
            case 'nickErr' : $("#nameWarn").html("昵称中不能包含特殊字符"); break;
            case 'passErr' : $("#passwordWarn").html("密码不能小于6位"); break;
            case 'diffPass' : $("#conWarn").html("两次密码必须一致"); break;
            case 'codeErr' : $('#codeWarn').html("邀请码不正确"); break;
        }
    }else{
        window.location.href = data.target;
    }
}
