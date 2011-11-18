var config = require('./config');
if(!config.debug) {
    // patch net module for connect to proxy
    require('./lib/net_patch');
}

var express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
    model = require('./models/index'),
    startDel = require('./lib/deleteDownload').startDel,
	form = require('connect-form'),
	RedisStore = require('connect-redis')(express);
	
//创建httpServer
var app = express.createServer(
	form({ uploadDir: config.tempDir, keepExtensions: true })
  , function(req, res, next) {
        if(req.form) {
            req.form.complete(function(err, fields, files){
                req.body = {};
                if(!err) {
                    req.form.fields = fields;
                    req.form.files = files;
                    req.body = fields;
                }
                next(err);
            });
        } else {
            return next();
        }
    });
//静态解析public文件夹的文件
app.use(express.static(__dirname+'/public',{maxAge:3600000*24*30}));
//app.use(gzippo.staticGzip(__dirname+'/public',{maxAge:3600000*24*30}));
//session和cookie
app.use(express.cookieParser());
app.use(express.session({
	secret: config.session_secret,
	store : new RedisStore()
}));

//post
app.use(express.bodyParser());

//app.use(express.logger({ format: '\x1b[36m:method\x1b[0m \x1b[90m:url\x1b[0m :response-time' }));

app.helpers({
config:config
});

//views setting
app.set("view engine", "html");
app.set("views", __dirname + '/views');
app.register("html", ejs);

app.get("/favicon.ico", function(req, res){
	res.writeHead(404, "Not Found");
	res.end();
})
//routing
require('./routes/logAndRegist')(app);
require('./routes/application')(app);
require('./routes/user')(app);
require('./routes/square')(app);
require('./routes/invitation')(app);
require('./routes/editor')(app);
require('./routes/appManager')(app);
require('./routes/interface')(app);
app.get("*", function(req, res){
  res.render("error", {message:"抱歉，你输入的网址可能不正确，或者该网页不存在。"});
});
app.listen(config.port);

startDel();
model.ensureIndexes();

var pid_path = __dirname + '/server.pid';
fs.writeFile(pid_path, '' + process.pid);
process.on('SIGINT', function () {
//    console.log('Got SIGINT.  Press Control-D to exit.', arguments);
    try {
        fs.unlinkSync(pid_path);
    } catch (e){
    }
    process.exit();
});
