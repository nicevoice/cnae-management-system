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
	console.log(action+" "+name);
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
	socket.write(action+" "+name+" "+num+"\n");
	socket.on('data', function(res){
			socket.destroy();
			res = ""+res;
			res = res.replace(/\x1B\[3[1234568]m/g, "");
			res = res.replace(/\x1B\[0m/g, "");
			if(res.indexOf("status")!==-1&&
			   res.indexOf("502")!==-1 &&
			   res.indexOf("Client Timeout")!==-1){
				res = ""
			}
			console.log(action+": "+ res);
			callback(res);
			
	});
	socket.on('end', function(data){
		callback(data||'');
		socket.destroy();
	})
}