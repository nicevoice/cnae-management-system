var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function(){
	//分页
	loadRecordContent();
});

function loadRecordContent() {
  var match = location.href.match(/page=\d+/)[0];
  var page = match.slice(match.lastIndexOf('=') + 1);
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_mnglog?page="+page,
    dataType : "json",
    error : function() {
      sAlert("警告", "服务器连接错误");
    },
    success : function(data) {
      if(data.status === "ok") {
        renderRecord(data.content);
        pagination();
      } else {
        sAlert("警告", data.msg);
      }
    }
  });
}

function renderRecord(content){
  var records = content.records,
      pages = content.pages,
      html = "";
  html += '<div id="records">'+
  '<table><tr><th>用户</th><th>操作</th><th>时间</th></tr>';
  for(var i=0, len=records.length; i!=len; ++i){
    var record = records[i];
    html += '<tr id="'+record.email+'Tr">' + 
    '<td>' + record.email + '</td>' + 
    '<td>' + record.action + '</td>' +
    '<td>' + record.recordTime + '</td></tr>'
  }
  html += '</table></div>';
  html += '<div class="pagination"><ul><li class="prev"><a href="#">&larr; 前一页</a></li>';
  var tooMany = false;
  for(var i=1; i<=pages; ++i){
    var url = location.href;
    url = url.slice(0, url.lastIndexOf('/'));
    if(i<=3||i>=pages-3||Math.abs(page-i)<=2){
      html += '<li><a href='+url+'/mnglog?page='+i+'">'+i+'</a></li>';
    }else{
      if(tooMany===false){
        tooMany = true;
        html+='<li class="disabled"><a href="javascript:void(0)">…</a></li>';
      }
    }
  }
  html += '<li class="next"><a href="#">后一页 &rarr;</a></li></ul></div>';
  $("#record-content").html(html);
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