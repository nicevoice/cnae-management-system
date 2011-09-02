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
	console.log(data);
	callback(data);
	socket.end();
	})
};

exports.getLog = function(action, name, num, callback){
	console.log(action);
	var socket = net.createConnection(port);
	socket.on('error',function(e){
		log.error(e.message);
		socket.destroy();
		callback(e.message);
	});
	socket.write(action+" "+name+" "+num+"\n");
	var res = "";
	socket.on('data', function(data){
			socket.end();
			console.log(""+data);
			callback(""+data);
	});
	socket.on('end', function(data){
		callback(data||'');
		socket.end();
	})
}