var app = require('./app');
var config = require('./config');
var fs = require('fs');
app.listen(config.port);
console.log("server start listen on "+ config.port);
var pid_path = __dirname + '/server.pid';
fs.writeFile(pid_path, '' + process.pid);
