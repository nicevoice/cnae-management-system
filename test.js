var exec  = require('child_process').exec;

exec("unzip /home/deadhorse/code/cnae-management-system/memcached.zip", function(){
	console.log(1);
});