var fs = require("fs"),
    exec = require('child_process').exec,
    delPath = __dirname.slice(0, __dirname.lastIndexOf("/")+1)+"public/download/",
    downloadTime = 5*60*1000,
    delInterval = 1000;

exports.startDel = function(){
  setInterval(delZip(), delInterval);
}

delZip = function(){
  //读取目录
  fs.readdir(delPath, function(err, files){
    if(err){
      log.error(err.toString());
    }else{
      //如果文件生成时间比现在的时间早downloadTime，就删除
      var now = new Date().getTime();
      for (var i=0, len=files.length; i<len; i++) {
	      var file = files[i];
        console.log(file);
        console.log(file.slice(file.lastIndexOf('/')+1, file.lastIndexOf('.')));
        var genTime = parseInt(file.slice(file.lastIndexOf('/')+1, file.lastIndexOf('.')));        
        console.log(genTime);
        if(now - genTime > downloadTime){
          fs.unlink(delPath+file, function(err){
            if(err)
            log.error(err.toString());
            });
        }
      }
    }
  });
}
