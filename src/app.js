var config = require('./config'),
    connect = require('connect'),
    render = require('./lib/render'),
    cookie = require('./lib/cookie'),
    uid = require('./lib/uid'),
    ejs = require('ejs'),
    fs = require('fs'),
    basename = require('path').basename,
    RedisStore = require('connect-redis')(connect);
if(!config.switchs.debug) {
    // patch net module for connect to proxy
    require('./lib/net_patch');
}
require('./lib/patch');


//创建httpServer 
var app = connect();

//favicon
app.use(connect.limit('10mb'));
app.use(connect.favicon());
//static
//app.use(connect.staticCache());
app.use(connect.static(__dirname+'/public', {maxAge: 3600000 * 24 * 365}));

//session和cookie
var sessionStore = new RedisStore({pass:config.redisPassword});
app.use(connect.cookieParser());
app.use(connect.session({
    secret: config.session_secret,
    store : sessionStore
}));

//post
app.use(connect.bodyParser());
app.use(connect.csrf());
//render power by ejs
app.use(render({
    root:__dirname + '/views',
    cache:true,
    csrf:true,
    helpers:{
        config:config,
    }
}));
//log
connect.logger.token('email', function(req ,res){return req.session&&req.session.email;});
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
if(process.env.NODE_ENV!=='test'){
  app.use(connect.logger({ 
    stream : fs.createWriteStream(config.reqLogPath+'.worker'+config.token),
    format: ':email | :remote-addr | :date | :response-time | :method | :url | :body'
  }));
}

/***
* socket.io for logs 
*/
var i=0;
var getSession = function(id, cb){
  sessionStore.get(id, function(err, session){
  //  console.log(++i, id, err, session);
    if(err){
      cb(err);
    }else{
      cb(null, session)
    }
  })
}
require('./controllers/logSocketIO')(app, getSession);
//routing
fs.readdirSync(__dirname + '/routes').forEach(function(filename){
  if (!/\.js$/.test(filename)||filename==='middleware.js') return;
  var name = basename(filename, '.js');
  app.use(connect.router(require('./routes/'+name)));
})  

app.use(function(err, req, res, next){
  if(res.render){
    res.render("error", {message:err.toString()});
  }else{
    res.setHeader('Content-Type', 'text/html');
    res.end(err.toString());
  }
});

app.use(function(req, res){
      res.render("error", {message:"抱歉，你输入的网址可能不正确，或者该网页不存在。"});
    });
module.exports = app;
