var net = require('net'),
	log = require("../config").logWithFile,
	port = require("../config").socketPort;
exports.onOff = function(action, name, callback){
	var socket = net.createConnection(port);
	socket.on('error',function(e){
		log.error(e.message);
		socket.destroy();
		callback({msg:e.message});
	});
	socket.write(action + " "+ name +"\n");
	socket.on('data', function(data){
	data = ""+data;
	data = eval('('+data+')');
	callback(data);
	socket.destroy();
	})
};


exports.getLog = function(action, name, num, callback){
	var socket = net.createConnection(port);
	socket.on('error',function(e){
		log.error(e.message);
		socket.destroy();
		callback("");
	});
	var resTimeout;
	socket.write(action+" "+name+" "+num+"\n");
	var res = "";
	socket.on('data', function(data){	//两秒获取不到数据就返回
			clearTimeout(resTimeout);
			res += data;
			if(res.indexOf("status")!==-1&&
			   res.indexOf("502")!==-1 &&
			   res.indexOf("Client Timeout")!==-1){
				res = "";
			}
			resTimeout = setTimeout(function(){
				res = res.replace(/\x1B\[3[1234568]m/g, "");
				res = res.replace(/\x1B\[0m/g, "");
				socket.destroy();
				callback(res);
			}, 2000);
	});
	socket.on('end', function(){
		callback(res||'');
		socket.destroy();
	})
}