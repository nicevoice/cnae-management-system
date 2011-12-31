var config = {
	cmdPort :1128,
	labs:{
		port:1129,
		path:'/developers/checkUser.do',
		secret : 'input tb secret'
	},
	tempDir : __dirname + '/temp',
	github:{
		keyDir:__dirname+'/temp/key'
	}
}

module.exports = config;