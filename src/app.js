var config = require('./config'),
    connect = require('connect'),
    render = require('./lib/render'),
    cookie = require('./lib/cookie'),
    uid = require('./lib/uid'),
    ejs = require('ejs'),
    fs = require('fs'),
    form = require('connect-form'),
    basename = require('path').basename,
    RedisStore = require('connect-redis')(connect);
if(!config.switchs.debug) {
    // patch net module for connect to proxy
    require('./lib/net_patch');
}
require('./lib/patch');


//创建httpServer 
var app = connect();

//multi-data form
app.use(form({ uploadDir: config.tempDir, keepExtensions: true }));
app.use(function(req, res, next) {
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
//favicon
app.use(connect.favicon());
//static
//app.use(connect.staticCache());
app.use(connect.static(__dirname+'/public', {maxAge: 3600000 * 24 * 365}));

//session和cookie
app.use(connect.cookieParser());
app.use(connect.session({
    secret: config.session_secret,
    store : new RedisStore({pass:config.redisPassword})
}));

//post
app.use(connect.bodyParser());
app.use(connect.csrf());
//log
connect.logger.token('email', function(req ,res){return req.session.email;});
connect.logger.token('body', 
function(req, res){
  var body = req.body, bodyStr="";
  if(body){
    for(var key in body){
      bodyStr += key + ":" + body[key] + " ";
    }
  }
  return bodyStr;
});
app.use(connect.logger({ format: ':email | :remote-addr | :date | :response-time | :method | :url | :body'}));
//render power by ejs
app.use(render({
    root:__dirname + '/views',
    cache:true,
    csrf:true,
    helpers:{
        config:config,
    }
}));

//routing
fs.readdirSync(__dirname + '/routes').forEach(function(filename){
  if (!/\.js$/.test(filename)||filename==='middleware.js') return;
  var name = basename(filename, '.js');
  app.use(connect.router(require('./routes/'+name)));
})  
app.use(connect.router(function(methods){
    methods.get("*", function(req, res){
      res.render("error", {message:"抱歉，你输入的网址可能不正确，或者该网页不存在。"});
    });
}));
module.exports = app;
