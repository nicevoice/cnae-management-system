$(function() {
	loadContent();
});
function bindMouseAbout(){
		$('div .application').each(function(index) {
		$(this).mouseenter(function() {
			$('span:eq(' + index + ')').css("display", "block");
			});
			$(this).mouseleave(function() {
			$('span:eq(' + index + ')').css("display", "none");
			});
	});
}
function loadContent(){
  $.ajax({
    cache:false,
    type:"get",
    url:"/application/load_apps",
    dataType:"json",
    error:function(){
        sAlert("警告", "服务器连接错误");    
    },
    success:function(data){
      if (data.status === "ok") { 
      	var content = data.content; 
				loadOwnApps(content.ownApps, content.switchs.labs);
				if(!content.switchs.labs){
					loadOtherApps(content.otherApps);
     		}
     		bindMouseAbout();
      }
      else{
        sAlert("警告", "服务器连接错误");    
      }
    }
  });
}
function loadOwnApps(ownApps, labs){
	var length = ownApps.length;
	var html = "<ul>";
	for(var i=0; i!=length; ++i){
		var app = ownApps[i];
		html += '<div class="application ownApp" id="'+
		app.appDomain+'-div"><li class="appLi">' + '<img src="/images/arrow.gif"></img>' +
		'&nbsp;'+'<a href="/application/manage/' + app.appDomain + '/sum" title="管理" class="title">'+
		app.appName + '</a>';
		if(!labs){
			html += '<span class="appActions" id="appAction-'+ app.appDomain +'">' + 
			'<a class="deleteApp" href="javascript:void(0)"'+
			'onclick="delApp(\'' + app.appDomain +'\')">删除</a></span>';
		}
		html+='</li></div>';
	}
	if(!labs){
		html += '<div id="createApp"><li>' ;
		if(length < 10){
			html += '<a href="/application/newApp">创建新应用('+length+'/10)</a>';
		}else{
			html += '应用数量已达上限';
		}
		html += '</li></div>'
	}
	html +='</ul>';
	$("#myApp-content").html(html);
}
function loadOtherApps(otherApps){
	var length = otherApps.length;
	var html = "<ul>";
	for(var i=0; i!=length; ++i){
		var app = otherApps[i];
		html += '<div class="application otherApp" id="coop-' + app.appDomain + '">'+
		'<li class="appLi">';
		if(app.active === 0){
			html += '<img src = "/images/inactive.gif"></img>&nbsp;';
		}else{
			html += '<img src="/images/arrow.gif"></img>&nbsp;';
		}
		html += '<a href="/application/manage/' + app.appDomain + '/sum" title="管理" id="inactived' + 
		app.appDomain + '" class="title';
		if(app.active === 0){
			html += ' inactiveApp';
		}
		html += '">' + app.appName + '</a>' + '<span class="appActions" id="appAction-' + app.appDomain + '">';
		if(app.active === 0){
			html += '<a class="appActive" id="active-' + app.appDomain + '" href="javascript:void(0)"' + 
			'onclick="active(\'' + app.appDomain + '\')">先点此激活应用 </a>'  
		}
		html += '<a class="deleteApp" href="javascript:void(0)"' + 
		'onclick="delCoopApp(\'' + app.appDomain +'\')">退出</a>' + 
		'</span></li></div>';
	}
	html += '</ul>'
	$("#otherApp-content").html(html);
}
//删除自己的应用
function delApp(domain){
	str = '删除应用将清空对应的一切数据，确定要删除吗？';
	if(!confirm(str))
		return false;
 $.ajax({
    cache:false,
    type:"POST",
    url:"/delete",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.status==="error")
        sAlert("警告",data.msg);
      else{
	      var deleteDiv = document.getElementById(domain+"-div");
	      deleteDiv.parentNode.removeChild(deleteDiv);
	      var appNums = 0;
		  $('div .application').each(function(index) {
		    if($(this).hasClass('ownApp'))appNums++;
				$(this).unbind("mouseenter").unbind("mouseleave");
				$(this).mouseenter(function() {
				$('span:eq(' + index + ')').css("display", "block");
				});
				$(this).mouseleave(function() {
				$('span:eq(' + index + ')').css("display", "none");
				});
			});
		 	$('#createApp li').html('<a href="/application/newApp">创建新应用('+appNums+'/10)');
		 
      	}
   	}
});
}

function active(domain){
$.ajax({
    cache:false,
    type:"POST",
    url:"/join",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      alert("ajax error");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
		$("#coop-"+domain + " img").attr('src', '/images/arrow.gif');
      	$("#active-"+domain).css("display", "none");
      	$("#inactived"+domain).removeClass("inactiveApp");
      	}
   	}
});	
}

function delCoopApp(domain){
str = '退出项目将清空对应的一切数据，确定要退出吗？';
if(!confirm(str))
	return false;
$.ajax({
    cache:false,
    type:"POST",
    url:"/deleteCoop",
    dataType:"json",
    data:{domain:domain},
    error:function(){
      sAlert("警告","连接错误，请稍后再试");
    },
    success:function(data){
      if(data.done===false)
      sAlert("警告","连接错误，请稍后再试");
      else{
	      var deleteNode = document.getElementById("coop-"+domain);
	      deleteNode.parentNode.removeChild(deleteNode);
	      	$('div .otherApp').each(function(index) {
			$(this).unbind("mouseenter").unbind("mouseleave");
			$(this).mouseenter(function() {
			$('.otherApp span:eq(' + index + ')').css("display", "block");
			});
			$(this).mouseleave(function() {
			$('.otherApp span:eq(' + index + ')').css("display", "none");
			});
	});
      	}
   	}
});	
}

