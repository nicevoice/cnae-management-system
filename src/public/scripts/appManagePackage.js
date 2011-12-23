  var exPackage = {         //默认的package.json样例
    "name" : "exampleName",
    "preferGlobal" : true,
    "version" : "1.0.1",
    "author" : "David",
    "description" : "Description of your app",
    "contributors" : [{
      "name" : "Tony",
      "email" : "Tony@gmail.com"
      },
      {
      "name" : "Panny",
      "email" : "Panny@gmail.com" 
      }],
    "bin" : {
      "http-server" : "./bin/start"
    },
    "scripts" : {
      "start": "node ./bin/http-server", 
      "test": "vows --spec --isolate"  
    },
    "main" : "./lib/http-server",
    "keywords": [ 
      "cli", 
      "http", 
      "server" 
    ],
    "dependencies" : { 
      "colors"   :  "*", 
      "flatiron" :  "0.1.x", 
      "optimist" :  "0.2.x", 
      "union"    :  "0.1.x", 
      "ecstatic" :  "0.1.x" 
    },
    "noAnalyze": true, 
    "devDependencies": { 
      "vows"    :  "0.5.x", 
      "request" :  "2.1.x" 
    }, 
    "bundleDependencies": [], 
    "license": "MIT", 
    "engine": { 
      "node": ">=0.4" 
    }             
  }

var hints = {   //提示
  "home": '这是编写package.json的交互式向导页面。<br/>单击可以编辑。<p style="color:#777">灰色为未输入项</p><p style="color:#F30">红色为必填项</p>',
  "name": "The unique name of your package. <br/><br/> This will also indicate the name of the package in the <a href='http://search.npmjs.org'>NPM global repository</a> ( if you choose to publish it. ) <br/><br/> On <a href='http://nodejitsu.com'>Nodejitsu</a>, this property will represent the name of your application.",
  "preferGlobal": "<a href='http://en.wikipedia.org/wiki/Flag_%28computing%29'>Flag</a> that indicates this package prefers to be installed globally. <br/><br/> This is usually reserved for packages that contain <a href='http://en.wikipedia.org/wiki/Command-line_interface'>command line interfaces</a> ( CLIs ). <br/> <br/> In most situations, you will <strong>NOT</strong> use this property.",
  "version": "Version of the package as specified by <a href='http://semver.org'>Semantic Versioning</a>.<br/><br/> It's important to keep track of your package versions <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>in a smart way</a>. If you don't follow standard versioning techniques, it will be difficult for users to keep track of your packages. <br/><br/> Consider the following version updates: <br/><br/> 0.1.0 -> 0.1.1 should be <strong>non-breaking</strong>. <br/> 0.1.1 -> 0.2.0 could be <strong>breaking</strong>.",
  "author": "The author of the project. <br/><br/>Hopefully one day soon, it will be your name!",
  "description": "The description of the project. <br/><br/>Try to keep it short and concise.",
  "contributors": "An array of objects representing contributors to the project. <br/><br/> Each object represents one contributor.",
  "bin": "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of binary script names and node.js script paths. <br/> <br/> This is used to expose binary scripts from your package. It's useful for creating command line interfaces.",
    "http-server" : "Installs a binary script called <strong>http-server</strong> which is linked to <strong>./bin/http-server</strong> in the local package. <br/><br/>If we have installed this package globally using <strong>npm install http-server -g</strong> we will be able to call this new command <strong>http-server</strong> from anywhere on our system.",
  
  "scripts": "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of <a href='http://blog.nodejitsu.com/npm-cheatsheet'>npm commands</a> and node.js script paths. <br/> <br/> This is used to map specific entry points into your package that npm can use <a href='http://blog.nodejitsu.com/npm-cheatsheet'>in all sorts</a> of cool ways.",
    "start": "The start-up script for the package. <br/><br/>When running <strong>npm start</strong> this script will be called.",
    "test": "The test script for the package. <br/><br/>When running <strong>npm test</strong> this script will be called.",
    
  "main": "The main entry point of the package. <br/><br/>When calling <strong>require('http-server')</strong> in node.js this is the file that will actually be required.<br/><br/>It's <strong>highly advised</strong> that requiring the <strong>main</strong> file <strong>NOT</strong> generate any side-effects. <br/><br/>For instance, requiring the main file should <strong>NOT</strong> start up an HTTP server or connect to database. Instead, you should create something like <strong>exports.init</strong> in your <strong>main</strong> script.",
  
  "repository": "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of source code repositories. <br/><br/> In our case, we will specify a <a href='http://git-scm.com/'>git</a> repository hosted on <a href='http://github.com/'>Github</a>",
    "type": "Type of source code repository. <br/><br/> In our case, <a href='http://git-scm.com/'>git</a>.",
    "url": "URL of source code repository. <br/><br/> In our case, <a href='http://github.com/'>Github</a>.",
  "keywords": "An array of keywords which describe your package. <br/><br/>This is useful for users who search for packages on <a href='http://search.npmjs.org/'>search.npmjs.org</a>",
  "dependencies": "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of npm packages and versions. <br/> <br/> This is used to specify the <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>dependencies for your packages</a>.",
    "colors"   : "Require the <a href='http://github.com/marak/colors.js'>colors</a> module as a dependency with a wildcard version. <br/><br/> Using a <strong>wildcard</strong> version is usually <strong>NOT</strong> recommended. <br/><br/>Colors is unique, in that it's API is intended to always be backwards compatible. <br/><br/> Most packages will be too complex to ever work with a wildcard version.",
    "optimist" :  "Require the <a href='http://github.com/substack/node-optimist'>optimist</a> module as a dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>0.2.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
    "flatiron" :  "Require the <a href='http://github.com/flatiron/flatiron'>flatiron</a> module as a dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>0.1.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
    "ecstatic" :  "Require the <a href='https://github.com/jesusabdullah/node-ecstatic'>ecstatic</a> module as a dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>0.1.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
    "union" :  "Require the <a href='http://github.com/flatiron/union'>union</a> module as a dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>0.1.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
  "noAnalyze": "<a href='http://en.wikipedia.org/wiki/Flag_%28computing%29'>Flag</a> that indicates if the package should not have it's source code analyzed in anyway.<br/><br/> Usually, you can simply <strong>ignore</strong> this field. <br/><br/> At <a href='http://nodejitsu.com'>Nodejitsu</a>, we will automatically attempt to scan packages for missing dependencies, bugs, and syntax errors. <br/><br/>If you are confident your package is correct you can set <strong>noAnalyze</strong> to <strong>true</strong>.",
  
  "devDependencies":  "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of npm packages and versions. <br/> <br/> This is used to specify <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>package dependencies</a> intended only for <strong>development</strong> purposes. <br/><br/> Usually, you will put <a href='http://en.wikipedia.org/wiki/Test_automation_framework'>testing framework dependencies</a> listed here. <br/><br/>Install these using: <strong>npm install --dev</strong>.",
    "vows" : "Require the <a href='http://github.com/cloudhead/vows'>vows</a> module as a development dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>0.5.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
    "request": "Require the <a href='http://github.com/mikeal/request'>request</a> module as a dependency with a ranged version. <br/><br/>Using an <strong>x</strong> indicates that the package will attempt to use the highest value version for <strong>x</strong>. <br/><br/>In <strong>2.1.x</strong>, we have a wildcard <strong>ONLY</strong> for the <strong>patch</strong> version. <br/><br/>The hope here, is that the package author has followed <a href='http://blog.nodejitsu.com/package-dependencies-done-right'>best-practices</a> and <strong>patch</strong> versions of the package will <strong>NOT</strong> be breaking.",
  "bundleDependencies": "An array containing a list of package names you have bundled in your package. <br/><br/>The convention here is to make sure your bundled dependencies exist in the <strong>node_modules/</strong> folder. <br/><br/>Packages listed in <strong>bundleDependencies</strong> will now remain locked into the version contained in the <strong>node_modules/</strong> folder.",
  "license": "The license which you prefer to release your project under. <br/><br/> <a href='http://en.wikipedia.org/wiki/MIT_License'>MIT</a> is a good choice.",
    "engine": "A <a href='http://stackoverflow.com/questions/2364289/what-exactly-is-a-hash-in-regards-to-json'>hash</a> containing key/pair mappings of <strong>engine</strong> versions. <br/> <br/> This is used to specify the versions of <a href='http://nodejs.org'>node.js</a> your package is <strong>known</strong> to work correctly with.",
    "node": "The version of <a href='http://nodejs.org'>node.js</a> this package is <strong>known</strong> to work with. <br/><br/> Like dependencies, this uses <a href='http://semver.org'>Semantic Versioning</a>."
  
};
//pair template
var tplPair = '<span class="pair $color$" id="$key$">' +
              '<span class="key">$key$</span> : ' + 
              '<span class="value" id="$key$-value">$value$</span>,<br /></span>';


var appPackage = {};  //save already typed package item
var showPackage = clone(exPackage); //package to display
var valueHtmlLast = {}; //save last value of html
var error = "";       //save error (package.json's error)

var colors = {};  //save back-ground color & color for each row

var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);

$(function(){
  getPackage();
  $('#submit-package').click(submit);
})
/***
* get package.json in apps
*/
function getPackage(){
  $.ajax({
    cache : false,
    type : "get",
    url : "/application/manage/" + domain + "/load_package",
    dataType : "json",
    error: function(err){
    },
    success: function(data){
      if(data.status==='ok'){
        appPackage = data.appPackage;
      }else{
        appPackage = {};
        error = data.msg;
      }
      //merge appPackage and exPackage
      for(var key in appPackage){
        if(exPackage[key]){
          showPackage[key] = appPackage[key];
          colors[key] = {color:"exsits"};
        }
      }
      loadDefault();
    }
  })
}
/***
*  load default info in exPackage
*/
function loadDefault(){
    var htmls = [];
  for(var key in showPackage){
    htmls.push(tplReplace(tplPair, {
      '$key$' : key,
      '$value$' : format(showPackage[key]),
      '$color$' : colors[key]?colors[key].color||'' : ''
    }));
  }
  var htmlStr = showIt(htmls.join(''))
  $('pre').html('{<br />' + htmlStr + '}');
  $('#main .key').css('color', '#F30');
  $('#hint').html(hints['home']);
    bindMouse();
}
/***
* change the package value to display
*/
function showIt(value){
  return value.replace(/[\n\r]/g, '').
  replace(/[,\[\{]/g, function(data){
    return data + '<br />';
  }).
  replace(/[\]\}]/g, function(data){
    return '<br />' + data;
  });  
}
/***
*  bind mouse enter & click
*/
function bindMouse(){
  $('.npm .pair').mouseover(function(e){
    var el = this;
    var key = $('.key', el).html().replace(/"/g, '');
    $('#hint').html(hints[key]);
  });
    getAuth(domain, function(err, auth){
    if(auth.role<=2 && auth.active===1){
      $('.npm .pair').bind('click', pairClick);
    }
  })
}
/***
* bind event to click on pair 
*/
function pairClick(){
    var key = $(this).attr('id');
    var showValue, addon='';
    if(typeof  showPackage[key]==='string'){
      showValue = showPackage[key];
      addon='\"';
    }else{
      var showValue = format(showPackage[key]);
    }
    valueHtmlLast[key] = $('#'+key+'-value').html();
    if((showValue!==format(appPackage[key])&&showValue===format(exPackage[key]))){
      showValue = '';
    }else{
      showValue = addon + showValue + addon;
    }
    var input = $('<input type=text id="'+key+'-input">');
    input.attr('value', showValue);
    $('#'+key+'-value').html('').append(input);

    bindInput(key);
    $(this).unbind('click');
  } 
/***
* bind evnet to input
*/
function bindInput(key){
  $('#'+key+'-input').focus().  //first focus
        bind('blur', function(){ //bind when blur
          var val = $(this).val().trim();
          var spanValue = $('#'+key+'-value');
          if(val===format(showPackage[key])&&val!==format(exPackage[key])){
            spanValue.html(valueHtmlLast[key]);
          }else{
            if(val===''){
              spanValue.html(showIt(format(exPackage[key])));
            }else{
              var jsonStr = '{"' + $('#'+ key + ' .key').html() + '":' + val + '}';
              var wrong = false;
              var json;
              try{
                json = JSON.parse(jsonStr);
              }catch(err){
                wrong = true;
              }
              if(wrong){
                showPackage[key] = val;
                $('#'+key).css('color', '#777');
                $('#'+key).css('background-color', '#FCC');
                spanValue.html(showIt(format(val)));
              }else{
                appPackage[key] = showPackage[key] = json[key];
                $('#'+key).css('color', '#000');
                $('#'+key).css('background-color', '#FFF');
                spanValue.html(showIt(format(json[key])));
              }
            }
          }
          $('#'+key).bind('click', pairClick);
        });
}

function submit(){
  $.ajax({
    cache : false,
    url : "/application/manager/"+domain+"/submit/package",
    type : "get",
    dataType : "json",
    data:appPackage,
    error:function(){},
    success:function(data){
      if(data.status==='ok'){
        sAlert('', '修改成功');
      }else{
        sAlert('警告', '修改失败:'+data.msg);
      }
    }
  })
}