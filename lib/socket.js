var net = require('net');
var socket = new net.Socket();
socket.connect(1128);
exports.sendSocket = function(action, name, callback){
socket.write("start app1\n");
socket.on('data', function(data){
console.log(""+data);
data = ""+data;
data = eval('('+data+')');
console.log(data);
console.log(data.status);
callback(data);
socket.destroy();
})};