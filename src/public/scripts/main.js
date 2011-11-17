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
var  tplOwnApp ='<div class="application ownApp" id="$appDomain$-div">'+
                '<li class="appLi">'+
                '<img src="/images/arrow.gif"></img> '+
                '<a href="/application/manage/$appDomain$/sum" title="管理" class="title">$appName$</a>'+
                '$delete$'+
                '</li></div>',
     tplDelete = '<span class="appActions" id="appAction-$appDomain$">'+
                 '<a class="deleteApp" href="javascript:void(0)"'+
                 'onclick="delApp(\'$appDomain$\')">删除</a></span>',
     tplAppMax = '<div id="createApp"><li>应用数量已达上限</li></div>',
     tplCreateApp = '<div id="createApp"><li>'+
                    '<a href="/application/newApp">创建新应用($length$/10)</a>'+
                    '</li></div>';
function loadOwnApps(ownApps, labs){
    var appContent = "",
        len = ownApps.length;
    for(var i=0; i!=len; ++i){
        var app = ownApps[i], del='';
        if(labs){
            del = '';
        }else{
            del = tplReplace(tplDelete, {
                '$appDomain$':app.appDomain
            });
        }
        appContent += tplReplace(tplOwnApp, {
            '$appDomain$':app.appDomain,
            '$appName$':app.appName,
            '$delete$':del
        })
    }
    if(!labs){
        if(len<10){
            appContent += tplReplace(tplCreateApp, {
                '$length$':len
            })
        }else{
            appContent += tplAppMax;
        }
    }
    $("#myApp-content").html('<ul>'+appContent+'</ul>');
} 
var  tplInactive = '<div class="application otherApp" id="coop-$appDomain$">' + 
                   '<li class="appLi">' + 
                   '<img src="/images/inactive.gif"></img>&nbsp;'+
                   '<a href="/application/manage/$appDomain$/sum" title="管理" id="inactived$appDomain$"'+
                   ' class="title inactiveApp">$appName$</a>' +
                   '<span class="appActions" id="appAction-$appDomain$">'+
                   '<a class="appActive" id="active-$appDomain$" href="javascript:void(0)"'+
                   'onclick="active(\'$appDomain$\')">先点此激活应用 </a>'+
                   '<a class="deleteApp" href="javascript:void(0)"' +
                   'onclick="delCoopApp(\'$appDomain$\')">退出</a>'+
                   '</span></li></div>',

      tplActive =  '<div class="application otherApp" id="coop-$appDomain$">' + 
                   '<li class="appLi">' + 
                   '<img src="/images/arrow.gif"></img>&nbsp;'+
                   '<a href="/application/manage/$appDomain$/sum" title="管理" id="inactived$appDomain$"'+
                   ' class="title">$appName$</a>' +
                   '<span class="appActions" id="appAction-$appDomain$">'+
                   '<a class="deleteApp" href="javascript:void(0)"' +
                   'onclick="delCoopApp(\'$appDomain$\')">退出</a>'+
                   '</span></li></div>';
function loadOtherApps(otherApps){
    var appContent = "";
    for(var i=0, len=otherApps.length; i!=len; ++i){
        var app = otherApps[i];
        if(app.active===0){
            appContent += tplReplace(tplInactive, {
                '$appDomain$':app.appDomain,
                '$appName$':app.appName
            })
        }else{
            appContent += tplReplace(tplActive, {
                '$appDomain$':app.appDomain,
                '$appName$':app.appName
            })            
        }
    }
    $("#otherApp-content").html('<ul>'+appContent+'</ul>');
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

