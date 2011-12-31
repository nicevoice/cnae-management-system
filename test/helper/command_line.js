var net = require('net');
var config = require('../config.test');

var cmds = {
	start : true,
	stop : true,
	restart : true,
	stdout : true,
	stderr : true,
	stdoutpipe : true,
	stderrpipe : true
}
function cmd(client){
	function onError(msg, code){
		var res = {
			cmd : "response",
			status:"error",
			code : code,
			msg : msg
		}
		client.end(JSON.stringify(res));
	}
	function onOk(msg){
		var res = {
			cmd : "response",
			status:"ok",
			msg : msg
		}
		client.write(JSON.stringify(res));
	}
	function onData(data){
		try{
			var command = JSON.parse(data);
		}catch(err){
			return onError('Head parse error', 600);
		}
		if(!command.app){
			return onError('Appname needed!');
		}
		if(!cmds[command.cmd]){
			return onError('Cmd not found', 600);
		}
		mockResponse(command);
	}
	function mockResponse(command){
		switch(command.cmd){
			//mock start
			case 'start' : 
				if(command.app==='app1'){
					onOk('App \"app1\" start ok.');return;
				}
				if(command.app==='app2'){
					onError('App \"app2\" is running.', 101);return;
				}
				client.end('{"cmd":"response", "status":"error"');return;
			case 'stdout' : 
				if(command.app==='app1'){
					var data = new Buffer(100);
					data.fill(45333);
					client.write('{"cmd":"response", "length":100}\n');
					client.write(data);
				}return;
			}
		}
	client.on('data', onData);	
}

module.exports = net.createServer(cmd);
module.exports.listen(config.cmdPort);