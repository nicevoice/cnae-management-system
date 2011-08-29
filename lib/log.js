var fs = require('fs');
var cwd = process.cwd() + '/',  //cwd返回当前工作目录
    INFO = 0,
    DEBUG = 1,
    WARNING = 2,
    ERROR = 3,
    TRACE = 4,
    INIT = 6,
    type = ['INFO', 'DEBUG', 'WARNING', 'ERROR', 'TRACE','LOG_INIT'],
    colors = [38, 34, 35, 31, 32, 36, 33],
    bufferSize = 20000;
    writeSize = 16384;

    exports.INFO = INFO;
    exports.DEBUG = DEBUG;
    exports.WARNING = WARNING;
    exports.ERROR = ERROR;
    exports.TRACE = TRACE;

    function getPos(){
      try{
        throw new Error();
      }
      catch(e){
        var pos = e.stack.split('\n')[4].split('(')[1].split(':');
        return pos[0].replace(cwd, '') + ':' + pos[1]; //通过抛出错误来得到所在位置。
      }
    }

    function pad2(num){
      return num>9?num:'0'+num;
    }

    function getTime(){
      var t = new Date();
      return [t.getFullYear(), '-', pad2(t.getMonth()+1), '-',
      pad2(t.getDate()), '-', pad2(t.getHours()), ':', pad2(t.getMinutes()),
      ':', pad2(t.getSeconds())].join('');
    }

    function formatLog(log, color){
      var tag = head = foot = '';
      if(color){
        head = '\x1B[';
        foot = '\x1B[0m';
        tag = colors[5] + 'm';
        color = colors[log.type] + 'm';
      }
      return [log.time, ' [', head, color, type[log.type], foot, '][', head, tag,
    log.pos, foot, ']', log.msg].join('');
  }

  exports.create = function (level, file){  //create对象返回了一系列操纵内部闭包log的函数。外部创建create对象以后，通过其返回的这些函数来输出。
    if(!level){//不输入level参数则默认为INFO，这个level是控制输出级别的
      level = INFO;
    }
    if(file){ //如果有输入日志输出地址，则建立buffer/pos等对象。同时注册一个process的监听事件，当进程退出的时候，将缓冲区的字符输出到文件中。
      var buffer = new Buffer(bufferSize);
      var pos = 0;
      var fd = fs.openSync(file, 'a');
      process.on('exit', function(){
      	console.log(file);
        fs.writeSync(fd, buffer, 0, pos, null);
      });
    }

    function log(type, msg){//定义一个用于输出的闭包
      if(type<level){ //级别不够level的都不输出
        return;
      }
      var log = {type:type, msg:msg, time:getTime(), pos:getPos()};
      console.log(formatLog(log, true));
      if(file){
        if(pos>=writeSize){
          fs.writeSync(fd, buffer, 0, pos, null);
          pos = 0;
        }
        pos += buffer.write(formatLog(log) + "\r\n", pos);
      }
    }
  console.log(formatLog({type:INIT, pos:file, time:getTime(), msg:'Log init with level ' + type[level]}, true));  //在创建这个对象的时候输出创建信息
  return {                //返回的操作函数
  info:function(msg){log(INFO, msg);},
  debug:function(msg){log(DEBUG, msg);},
  warning:function(msg){log(WARNING, msg);},
  error:function(msg){log(ERROR, msg);},
  trace:function(msg){log(TRACE, msg);}
  };
  }
