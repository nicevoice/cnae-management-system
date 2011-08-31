var net = require('net');
exports.sendSocket = function(action, name, callback){
var socket = new net.Socket();
socket.connect(1128);
socket.write(action + " "+ name +"\n");
socket.on('data', function(data){
data = ""+data;
data = eval('('+data+')');
callback(data);
socket.destroy();
})};