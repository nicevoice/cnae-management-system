var exec  = require('child_process').exec;

exec("unzip /home/deadhorse/code/cnae-management-system/memcached.zip", function(err,stdout,stderr){
	console.log(1);
});