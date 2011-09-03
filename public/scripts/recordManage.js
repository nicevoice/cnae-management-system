$(function(){
	//分页
	pagination();
});

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