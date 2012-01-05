var cluster = require('cluster');
var fs = require('fs');
var http = require('http');
var app = require('./app');
var config = require('./config');
var path = require('path');
if(cluster.isMaster){
  fs.writeFileSync(path.dirname(config.logPath)+'/worker.num', '1');
  if(config.switchs.debug){
    app.listen(config.port);
    console.log("server start listen on "+config.port+' by '+process.pid);       
  }else{
    var num = Math.ceil(require('os').cpus().length/2);//cpu的一半
    num = 1;
    var workers = {}, started_success = 0;
    var start = false, stop = false;
    var i=0;
    function initWorker(){
      var worker = cluster.fork();
      workers[worker.pid] = worker;
      worker.on('message', function(msg){
        if(msg.cmd==='started'){
          if(start){
            console.log('worker ' + msg.pid + ' restarted');
          }else{
            console.log('worker ' + msg.pid + ' started');
            started_success ++;
            if(started_success === num){
              start = true;
              console.log("server start on " + config.port);
            }
          }
        }
      })
      ++i;
      if(i<num){
        setTimeout(initWorker, 200);   
      }
    };
    setTimeout(initWorker, 200);

    cluster.on('death', function(worker){
      console.log('worker ' + worker.pid + 'died');
      delete workers[worker.pid];
      workers[worker.pid] = cluster.fork();
    })
    var pid_path = __dirname + '/server.pid';
    fs.writeFile(pid_path, '' + process.pid);
    process.on('exit', function () {
    //    console.log('Got SIGINT.  Press Control-D to exit.', arguments);
        try {
            fs.unlinkSync(pid_path);
        } catch (e){
        }
        for(var k in workers){
          workers[k].kill();
        }
        process.exit();
    });
      // process admin server
    http.createServer(function(req, res) { //开启一个监听本地的服务，通过HTTP控制restart和stop
      if (req.url === '/restart') {
        for (var k in workers) {
          workers[k].kill();
        }
      } else if (req.url === '/stop') {
        for (var k in workers) {
          workers[k].kill();
        }
        process.nextTick(function() {
          process.kill();
        });
      } else if (req.url === '/status') {
        for (var k in workers) {
          res.write('worker ' + k + ' alive\n');
        }
      }
      res.end(req.url + '\n');
    }).__listen(config.adminPort, '127.0.0.1');
    console.log('admin server listen on ' + config.adminPort);
    }
}else{
  app.listen(config.port, function(){
    process.send({cmd:'started', pid:process.pid});
  });
}


/*


app.listen(config.port);
console.log("server start listen on "+ config.port);

*/
