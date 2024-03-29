//格式化Date
/**
* 时间对象的格式化;
*/
Date.prototype.format = function(format){
 /*
  * eg:format="YYYY-MM-dd hh:mm:ss";
  */
  format = format||'YYYY-MM-dd hh:mm:ss';
 var o = {
  "M+" :  this.getMonth()+1,  //month
  "d+" :  this.getDate(),     //day
  "h+" :  this.getHours(),    //hour
      "m+" :  this.getMinutes(),  //minute
      "s+" :  this.getSeconds(), //second
      "q+" :  Math.floor((this.getMonth()+3)/3),  //quarter
      "S"  :  this.getMilliseconds() //millisecond
   }
   if(/((|Y|)+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
   }
 
   for(var k in o) {
    if(new RegExp("("+ k +")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    }
   }
 return format;
}

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
}
var res = require('http').ServerResponse;
res.prototype.json = function(obj){
  // allow status / body
  if (2 == arguments.length) {
    this.statusCode = arguments[1];
  }else{
    this.statusCode = 200;
  }
  var body = JSON.stringify(obj);
  this.charset = this.charset || 'utf-8';
  this.setHeader('Content-Type', 'application/json');
  return this.end(body);
};
res.prototype.sendJson = res.prototype.json;
