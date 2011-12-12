var inviteHref = $("#inviteHref").html();
$(function(){
	$("#sendInviteCode").click(sendInvite);
	$("#email").keydown(function(e) {
	  if(e.keyCode === 13) {
	    sendInvite();
	  }
  })
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
var tplInviteCodes = '<table padding="40px">'+ 
                     '</tr><th width="70%">邀请码</th><th>操作</th></th></tr>'+
                     '$codes$'+'</table>',
    tplCode = '<tr><td>$inviteHref$$code$</td>'+
              '<td><a id="send&$inviteHref$$code$" href="javascript:void(0)" onclick="sendThisInvite(this);">发送</a> | '+
              '<a id="delete&$code$" href="javascript:void(0)" onclick="deleteInvite(this);">删除</a></td></tr>',
    tplPagination = '<div class="pagination"><ul>'+
                    '<li class="prev"><a href="#">&larr; 前一页</a></li>'+
                    '$pages$'+
                    '<li class="next"><a href="#">后一页 &rarr;</a></li>'+
                    '</ul></div>',
    tplPage = '<li><a href=$url$/inviteCode?page=$i$>$i$</a></li>';
    tplEllipses = '<li class="disabled"><a href="javascript:void(0)">…</a></li>';
var tplGenerate = '<input type="button" class = "r3px button_orange submit" id="generateInviteCode"  value="生成">';
function renderInviteCode(content){
    var codes = content.codes,
        pages = content.pages,
        page = content.page,
        admin = content.admin,
        codeContent = '', pageContent = '', firstCode='您的邀请名额已经用完';
    for(var i=0, len=codes.length; i!=len; ++i){
        var code = codes[i];
        codeContent += tplReplace(tplCode, {
            '$inviteHref$':inviteHref,
            '$code$':code,
        });
        if(i===0){
            firstCode = inviteHref + code;
        }
    }
    var html = tplReplace(tplInviteCodes, {'$codes$':codeContent});
    if(pages>1){
        var tooManyLeft = false, tooManyRight = false;
        for(var i=1; i<=pages; ++i){
            var url = location.href;
            url = url.slice(0, url.lastIndexOf('/'));
            if(i<=1||i>=pages||Math.abs(page-i)<=1){
                pageContent += tplReplace(tplPage, {
                    '$url$':url,
                    '$i$':i
                });           
            }else{
                if(i<page && !tooManyLeft){
                    tooManyLeft = true;
                    pageContent+=tplEllipses;
                }else{
                    if(i>page && !tooManyRight){
                        tooManyRight = true;
                        pageContent += tplEllipses;
                    }
                }
            }
        }
        html += tplReplace(tplPagination, {'$pages$':pageContent});
    }
    $("#inviteCode").html(firstCode);
    $("#codes").html(html);
    if(admin){
        $('#generate').html(tplGenerate);
        $("#generateInviteCode").click(generate);
    }  
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
	if(here){
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
}

function generate(){
	$.ajax({
	cache:false,
	type:"post",
	url:"/inviteCode/gen",
    dataType:"json",
    data:{_csrf:_csrf},
	error:function(){
		sAlert("警告","ajax错误，请稍后再试");
	},
	success:function(data){
		if(data.status==='error'){
			sAlert("警告",data.msg);
		}else{
		$("#inviteCode").html(inviteHref+data.code);
		}
	}
	});
}

function sendInvite(){
	var code = $("#inviteCode").html(),
		email  =$("#email").val()||'';
	if(code.indexOf("http://cnodejs.net")!==0){
		sAlert("警告","请先选择邀请码！");
		return false; 
	}
	var regEmail = /^[a-zA-Z0-9_\.\-\+]+@(\w+)\.[\w\.]{2,8}$/;
	if(!regEmail.exec(email)){
		sAlert("警告","请输入合法的email地址");
		return false;
	}
	$.ajax({
    cache:false,
    type:"get",
    url:"/inviteCode/send",
    dataType:"json",
    data:{email:email,code:code},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告",data.warn);
      else{
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
    url:"/inviteCode/del",
    dataType:"json",
	data:{code:code, _csrf:_csrf},
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
