var str = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var strNum = str+"1234567890";
function getRandomNum(str){
   return (Math.floor(Math.random()*str.length));
}

exports.getRandomString = function(length){
   var s = str.split("");
   var result = "";
   for(var i=0; i!=length; ++i){
      result+=s[getRandomNum(str)];
   }
   return result;
}
exports.getRandomStringNum = function(length){
   var s = strNum.split("");
   var result = "";
   for(var i=0; i!=length; ++i){
      result+=s[getRandomNum(strNum)];
   }
   return result;
}
