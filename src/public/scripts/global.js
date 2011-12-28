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
function deleteFunc(){
  if(!document.getElementById("msgDiv")) return false;
  if(!document.getElementById("msgTitle")) return false;
    var title = document.getElementById("msgTitle");
    var msgObj = document.getElementById("msgDiv");
    msgObj.removeChild(title);
    document.body.removeChild(msgObj);
}
function sAlert(strTitle,strContent){ 
    deleteFunc();
    var msgw,msgh,bordercolor; 
    msgw=250;//提示窗口的宽度 
    msgh=100;//提示窗口的高度 
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
    msgObj.style.left = (document.body.scrollLeft + (window.innerWidth-msgw)/2)+"px"; 
    msgObj.style.top = (document.body.scrollTop + (window.innerHeight-msgh)/2) + "px"; 
    msgObj.style.font="14px/1.6em Verdana, Geneva, Arial, Helvetica, sans-serif"; 

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
function htmlSpecial(res){
	res = res.replace(/&/g, '&amp;');
	res = res.replace(/</g, '&lt;');
	res = res.replace(/>/g, '&gt;');
	res = res.replace(/'/g, '&acute;');
	res = res.replace(/"/g, '&quot;');
	res = res.replace(/\|/g, '&brvbar;');
	return res;
}

function getColor(res){
  res = res.replace(/\x1B\[38m/g, '<span class="infoColor">');
  res = res.replace(/\x1B\[34m/g, '<span class="debugColor">');
  res = res.replace(/\x1B\[35m/g, '<span class="warningColor">');
  res = res.replace(/\x1B\[31m/g, '<span class="errorColor">');
  res = res.replace(/\x1B\[32m/g, '<span class="traceColor">');
  res = res.replace(/\x1B\[36m/g, '<span class="fileColor">');
  res = res.replace(/\x1B\[33m/g, '');
  res = res.replace(/\x1B\[0m/g, '</span>');
  return res;
}
function handleLog(res){
  var lines = res.split("\n");
  for(var i=0, len=lines.length; i<len; ++i){
    var line = lines[i];
    if(line.indexOf(htmlSpecial('The "sys" module is now called "util".'))===0){
      lines[i] = "";
    }else{
      if(line.indexOf('cnode-app-engine/logs')!==-1){
        lines[i] = '<p>app start at ' + line.slice(0, line.indexOf('[')) + '</p>';
      }else{
		  if(line.indexOf(htmlSpecial('{"cmd":"response","status":'))===0){
          lines[i] = '<br />';
        }else{
          lines[i] = '<p>' + line + '</p>';
        }
      }
    }
  }
  return lines.join('');
}
function tplReplace(tpl, params){
    return tpl.replace(/\$.*?\$/g, function(data){
        return params[data];
    });
}

function getAuth(domain, cb){
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "get",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function(err) {
      cb(err)
    },
    success : function(data) {
      cb(null, data);
    }
  });
}

function clone(obj){
    var objClone;
    if (obj.constructor == Object){
        objClone = new obj.constructor();
    }else{
        objClone = [];
    }
    for(var key in obj){
        if ( objClone[key] != obj[key] ){
            if ( typeof(obj[key]) == 'object' ){
                objClone[key] = clone(obj[key]);
            }else{
                objClone[key] = obj[key];
            }
        }
    }
    return objClone;
}
