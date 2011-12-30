(function(){
  var email;
  var link = '<a id="resend" href="javascript:void(0);">发送激活邮件</a>'
  $(function(){
    $('#login').click(login);
    enterDown($('#pwd'), login);
  });
  resend = function(){
    $.ajax({
      cache:false,
      type:'get',
      url:'/regist/resend?e='+email,
      datatype:'json',
      error:function(){},
      success:function(data){
        if(data.status==='ok'){
          sAlert('', '邮件已发送，<a href="http://' + data.host + '" target="_blank">进入邮箱查看</a>');
          $(this).unbind('click');
        }else{
          sAlert('警告', '错误：'+data.msg);
        }
      }
    })
  }
  function login(){
    $.post('/checkLogin', {
      email : $('#email').val(),
      pwd : $('#pwd').val(),
      remeber_me : $('#remeber_me').attr('checked')?true:false,
      _csrf : $('#_csrf').val()
    }, fillWarn, 'json');
  }
  function fillWarn(data){
    if(data.status!=='ok'){
      switch(data.warn){
        case 'emailErr': $('#loginWarn').html('邮箱不正确'); break;
        case 'passErr' : $('#loginWarn').html('密码不正确'); break;
        case 'notActive' : $('#loginWarn').html('此帐号尚未激活<a id="resend" href="javascript:void(0);">发送激活邮件</a>'); 
        email = $('#email').val();
        $('#resend').bind('click', resend);break;
      }
    }else{
      window.location.href = $('#redirectUrl').val()||'/application';
    }
  }
})();