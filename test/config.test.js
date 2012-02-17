var config = {
	cmdPort :1128,
	cmdPortOnline : 1129,
	labs:{
		port:1333,
		path:'/developers/checkUser.do',
		secret : 'input tb secret'
	},
	tempDir : __dirname + '/temp',
	github:{
		keyDir:__dirname+'/temp/key'
	}
}

module.exports = config;