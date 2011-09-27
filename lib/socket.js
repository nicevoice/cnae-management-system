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
	if(data.indexOf('}')===-1){
		data === "{}";
	}else{
		data = JSON.parse(data);
	}
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
	var res, length=-1;
	socket.on('data', function(data){
      console.log(typeof data);	
			if(length===-1){
				length = data.slice(0,10).readInt32BE(0);
				res+=data.slice(10);
			}else{
				res += data;
			}
			if(res.length>=length){
				socket.destroy();
				callback(res);
			}
	});
	socket.on('end', function(){
		callback(res||'');
		socket.destroy();
	})
}