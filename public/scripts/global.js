$(function(){
	highlightPage();
	highlightSide();
});
function highlightPage() {
  if (!document.getElementsByTagName) return false;
  if (!document.getElementById) return false;
  if (!document.getElementById("navigation")) return false;
  var nav = document.getElementById("navigation");
  var links = nav.getElementsByTagName("a");
  var hasHere = false;
  for (var i=0; i<links.length; i++) {
    var linkurl = links[i].getAttribute("href");
    var currenturl = window.location.href;
    if (currenturl.indexOf(linkurl) != -1) {
  	  hasHere = true;    
      links[i].className = "here";
      var linktext = links[i].lastChild.nodeValue.toLowerCase();
      document.body.setAttribute("id",linktext);
    }
  }
  if(!hasHere){
  	links[0].className= "here";
    var linktext = links[0].lastChild.nodeValue.toLowerCase();
    document.body.setAttribute("id",linktext);
  }
}
//侧边栏
function highlightSide() {
  if (!document.getElementsByTagName) return false;
  if (!document.getElementById) return false;
  if (!document.getElementById("sidebar")) return false;
  var side = document.getElementById("sidebar");
  var links = side.getElementsByTagName("a");
  for (var i=0; i<links.length; i++){
    var linkurl = links[i].getAttribute("href");
    linkurl = linkurl.slice(linkurl.lastIndexOf('/')+1);
    var currenturl = window.location.href;
    currenturl = currenturl.slice(currenturl.lastIndexOf('/')+1);
    if (currenturl === linkurl && links[i].getAttribute("id")!=="editorSidebar") {
      links[i].className = "here";
      var linktext = links[i].lastChild.nodeValue.toLowerCase();
      document.body.setAttribute("id",linktext);
    }
  }
}
function sAlert(strTitle,strContent){ 
    var msgw,msgh,bordercolor; 
    msgw=300;//提示窗口的宽度 
    msgh=125;//提示窗口的高度 
    titleheight=25 //提示窗口标题高度 
    bordercolor="#336699";//提示窗口的边框颜色 
    titlecolor="#99CCFF";//提示窗口的标题颜色

    var sWidth,sHeight; 
    sWidth=document.body.offsetWidth; 
    sHeight=screen.height; 
    var msgObj=document.createElement("div") 
    msgObj.setAttribute("id","msgDiv"); 
    msgObj.setAttribute("align","center"); 
    msgObj.style.background="white"; 
    msgObj.style.border="1px solid " + bordercolor; 
    msgObj.style.position = "absolute"; 
    msgObj.style.left = (document.body.scrollWidth - window.innerWidth + (window.innerWidth-msgw)/2)+"px"; 
    msgObj.style.top = (document.body.scrollHeight - window.innerHeight + (window.innerHeight-msgh)/2) + "px"; 
    msgObj.style.font="14px/1.6em Verdana, Geneva, Arial, Helvetica, sans-serif"; 
    msgObj.style.marginLeft = "-225px" ; 
    msgObj.style.marginTop = -75+document.documentElement.scrollTop+"px"; 
    msgObj.style.width = msgw + "px"; 
    msgObj.style.height =msgh + "px"; 
    msgObj.style.textAlign = "center"; 
    msgObj.style.lineHeight ="25px"; 
    msgObj.style.zIndex = "10001";

    var title=document.createElement("h4");
    title.setAttribute("id","msgTitle"); 
    title.setAttribute("align","right"); 
    title.style.margin="0"; 
    title.style.padding="3px"; 
    title.style.background=bordercolor; 
    title.style.filter="progid:DXImageTransform.Microsoft.Alpha(startX=20, startY=20, finishX=100, finishY=100,style=1,opacity=75,finishOpacity=100);"; 
    title.style.opacity="0.75"; 
    title.style.border="1px solid " + bordercolor; 
    title.style.height="18px"; 
    title.style.font="14px Verdana, Geneva, Arial, Helvetica, sans-serif"; 
    title.style.color="white"; 
    title.style.cursor="pointer"; 
    title.title = "点击关闭"; 
    title.innerHTML="<table width='100%' class='noMargin'><tr><td align='left'><b>"+ strTitle +"</b></td><td align='right'>关闭</td></tr></table></div>"; 
    title.inn
    var deleteFunc = function(){
    document.getElementById("msgDiv").removeChild(title); 
    document.body.removeChild(msgObj); 
    } ;
    title.onclick=deleteFunc;
    
    document.body.appendChild(msgObj); 
    document.getElementById("msgDiv").appendChild(title); 
    var txt=document.createElement("p"); 
    txt.style.margin="1em 0" 
    txt.setAttribute("id","msgTxt"); 
    txt.innerHTML=strContent; 
    document.getElementById("msgDiv").appendChild(txt); 
    title.focus();
    document.onkeydown = function(e){
    	var ev = document.all ? window.event : e;
    	if(ev.keyCode==13||ev.keyCode==27) {
    		deleteFunc();
	    	document.onkeydown = function(e){};
		}
    }
} 
//扩展 去除前后字符串
String.prototype.trim = function() {
return this.replace(/^\s+|\s+$/g, "");
}
htmlSpecial = function(res){
	res = res.replace(/&/g, '&amp;');
	res = res.replace(/</g, '&lt;');
	res = res.replace(/>/g, '&gt;');
	res = res.replace(/'/g, '&acute;');
	res = res.replace(/"/g, '&quot;');
	res = res.replace(/\|/g, '&brvbar;');
	return res;
}
/*
function highlightPage() {
  if (!document.getElementsByTagName) return false;
  if (!document.getElementById) return false;
  if (!document.getElementById("navigation")) return false;
  var nav = document.getElementById("navigation");
  var links = nav.getElementsByTagName("a");
  for (var i=0; i<links.length; i++) {
    var linkurl = links[i].getAttribute("href");
    var currenturl = window.location.href;
    if (currenturl.indexOf(linkurl) != -1) {
      links[i].className = "here";
      var linktext = links[i].lastChild.nodeValue.toLowerCase();
      document.body.setAttribute("id",linktext);
    }
  }
}

addLoadEvent(highlightPage);*/
