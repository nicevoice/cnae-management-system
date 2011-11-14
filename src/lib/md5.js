var crypto = require('crypto');

exports.hex_md5 = function(s){
	var hash = crypto.createHash('md5');
	var buffer = new Buffer(s, 'utf-8');
	hash.update(buffer);
	return hash.digest('hex');
}

