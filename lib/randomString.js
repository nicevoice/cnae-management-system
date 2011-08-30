var str = "qwertyuiopasdfghjklzxcvbnm";
function getRandomNum(){
   return (Math.floor(Math.random()*str.length));
}

exports.getRandomString = function(length){
   var s = str.split("");
   var result = "";
   for(var i=0; i<=length; ++i){
      result+=s[getRandomNum()];
   }
   return result;
}
