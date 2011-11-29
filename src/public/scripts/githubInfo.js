var validator = new Validator();
var oldEmail = "";
$(function(){
	loadGithub();
});

function loadGithub(){
  $.ajax({
    cache:false,
    type:"GET",
    url:"/userCenter/github/info",
    dataType:"json",
    error:function(){alert("")},
    success:function(data){
      if(data.status==="ok"){
        renderGithub(data.content);
      }else{
        sAlert("警告", data.msg);
      }
    }	
  })
}
var tplPubkey = '<p>公钥:(复制到github>Account Setting>SSH Public Keys):</p>'+
                '<p><textArea rows="10", style="width:400px; margin-left:100px" readonly="true">$pubkey$</textArea></p>';
function renderGithub(content){
var pubkey = content.pubKey||'';
  oldEmail = content.email||'';
  if(pubkey&&oldEmail){
	  $("#pubkey").html(tplReplace(tplPubkey, {
	  	  '$pubkey$':pubkey
	  	}));
	  $("#githubEmail").val(oldEmail);
	}
  $("#submit").click(submitEmail);
  $("#githubEmail").keydown(function(e) {
	  if(e.keyCode === 13) {
	    submitEmail();
	  }
	})   
}
function submitEmail(){
	var email = $("#githubEmail").val()||'';
	if(!email || email===oldEmail){
	  return false;
	}
	if(!validator.verify('email', email)){
	  sAlert("警告", "email格式不正确");
	  return false;	
	}
	
	$.ajax({
    cache:false,
    type:"POST",
    url:"/userCenter/github/info_post",
    dataType:"json",
    data:{githubEmail:email},
    error:function(){
    	sAlert("警告","连接错误，请稍后再试");
    	},
    success:function(data){
    	if(data.status==="ok"){
    		sAlert("","修改成功");
    		loadGithub();
    	}else{
    		sAlert("警告",data.msg);
    	}
    }
	});
	return false;
}

