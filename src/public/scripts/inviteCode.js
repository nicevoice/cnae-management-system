var inviteHref = $("#inviteHref").html();
$(function(){
	$("#sendInviteByEmail").hide();
	$("#generateInviteCode").click(generate);
	$("#sendInviteCode").click(sendInvite);
	loadInviteCode();
})
function loadInviteCode(){
  var matchs = location.href.match(/page=\d+/);
  var page;
  if(matchs){
    page = matchs[0].slice(matchs[0].lastIndexOf('=') + 1);
  }else{
    page = 1;
  }
    $.ajax({
    cache : false,
    type : "get",
    url : "/load_inviteCode?page="+page,
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderInviteCode(data.content);
        pagination();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderInviteCode(content){
  var codes = content.codes,
      length = codes.length,
      pages = content.pages,
      page = content.page;
      html = "";
  html += '<table padding="40px"></tr><th width="70%">邀请码</th><th>操作</th></th></tr>';
  for(var i=0; i!=length; ++i){
    var code = codes[i];
    html += '<tr><td>' + inviteHref + code.code +'</td>' +
    '<td><a id="send&'+inviteHref + code.code + '" href="javascript:void(0)"' + 
    ' onclick="sendThisInvite(this);">发送</a> | ' +
    '<a id="delete&' + code.code + '" href="javascript:void(0)" onclick="deleteInvite(this);">删除</a></td></tr>';
  }
  html += '</table>';
  html += '<div class="pagination"><ul><li class="prev"><a href="#">&larr; 前一页</a></li>';
  var tooMany = false;
  for(var i=1; i<=pages; ++i){
    if(i<=3||i>=pages-3||Math.abs(page-i)<=2){
      html += '<li><a href="/inviteCode?page='+i+'">'+i+'</a></li>';
    }else{
      if(tooMany===false){
        tooMany = true;
        html+='<li class="disabled"><a href="javascript:void(0)">…</a></li>';
      }
    }
  }
  html += '<li class="next"><a href="#">后一页 &rarr;</a></li></ul></div>';
  $("#codes").html(html);
}
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
		$("#inviteCode").html(inviteHref+data.code);
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
	var regEmail = /^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/;
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