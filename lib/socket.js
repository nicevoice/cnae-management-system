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
	socket.write(action+" "+name+" "+num+"\n");
	var res = "";
	socket.on('data', function(data){
			console.log(""+data);
			res+=""+data;
	});
	socket.on('end', function(){
		console.log("end");
		callback(res);
	})
}