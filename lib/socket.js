var net = require('net'),
	log = require("../config").logWithFile,
	port = require("../config").socketPort;

function filter(str){
	str = srt.replace(/&/g, '&amp;');
	str = srt.replace(/</g, '&lt;');
	str = srt.replace(/>/g, '&gt;');
	str = srt.replace(/'/g, '&acute;');
	str = srt.replace(/"/g, '&quot;');
	str = srt.replace(/\|/g, '&brvbar;');
	return str;
}
	
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
	resTimeout = setTimeout(function(){
				filter(res);
				res = res.replace(/\x1B\[3[1234568]m/g, "");
				res = res.replace(/\x1B\[0m/g, "");
				socket.destroy();
				callback(res);
			}, 2000);
	socket.on('data', function(data){	//两秒获取不到数据就返回
			clearTimeout(resTimeout);
			res += data;
			if(res.indexOf("status")!==-1&&
			   res.indexOf("502")!==-1 &&
			   res.indexOf("Client Timeout")!==-1){
				res = "";
			}
			resTimeout = setTimeout(function(){
				filter(res);
				res = res.replace(/\x1B\[3[1234568]m/g, "");
				res = res.replace(/\x1B\[0m/g, "");
				console.log(res);
				socket.destroy();
				callback(res);
			}, 2000);
	});
	socket.on('end', function(){
		callback(res||'');
		socket.destroy();
	})
}