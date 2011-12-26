var email;
(function(){
  var link = '<a id="resend" href="javascript:void(0);">发送激活邮件</a>'
  $(function(){
    var warn = $('#loginWarn');
    if(warn.html()==='此帐号尚未激活'){
      warn.html(warn.html()+','+link);
      $('#resend').bind('click', resend);
      email = $('#email').val();
    }
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
})();