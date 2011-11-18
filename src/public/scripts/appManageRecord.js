var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);
$(function(){
	//分页
	loadRecordContent();
});

function loadRecordContent() {
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
var tplRecords = '<div id="records">'+
                 '<table><tr><th>用户</th><th>操作</th><th>时间</th></tr>'+
                 '$records$</table></div>',
    tplRecord = '<tr id="$email$Tr"><td>$email$</td><td>$action$</td><td>$recordTime$</td></tr>',
    tplPagination = '<div class="pagination"><ul>'+
                    '<li class="prev"><a href="#">&larr; 前一页</a></li>'+
                    '$pages$'+
                    '<li class="next"><a href="#">后一页 &rarr;</a></li>'+
                    '</ul></div>',
    tplPage = '<li><a href=$url$/mnglog?page=$i$>$i$</a></li>';
    tplEllipses = '<li class="disabled"><a href="javascript:void(0)">…</a></li>';
function renderRecord(content){
    var records = content.records,
        pages = content.pages;
    var recordContent = "", pageContent="";
    for(var i=0, len=records.length; i!=len; ++i){
        record = records[i];
        recordContent += tplReplace(tplRecord, {
            '$email$':record.email,
            '$action$':record.action,
            '$recordTime$':record.recordTime
        });
    }
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
    $("#record-content").html(tplReplace(tplRecords, {'$records$':recordContent})
     + tplReplace(tplPagination, {'$pages$':pageContent}));
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
