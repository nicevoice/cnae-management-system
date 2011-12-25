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
    },
    "customHost":"cnodejs.net"             
  }

var hints = {   //提示
  "home": '这是编写package.json的交互式向导页面。<br/>单击可以编辑。<p style="color:#777">灰色为未输入项</p><p style="color:#F30">红色为必填项</p>'+
          '<p class="exsits-package">黑色为已存在项</p><p class="warn-package exsits-package">黄色背景为类型不匹配项</p><p class="wrong-package">红色背景为输入有误</p>',
  "name": "type:string<br/>在NAE上应用的名称。 <br/> 如果要发布到<a href='http://search.npmjs.org' target='_blank'>NPM</a>，这也将是模块在NPM的名称。 <br/>",
  "preferGlobal": "type:boolean<br/>提示是否需要在安装的时候选择全局安装。<br/>在NAE上不需要填写。",
  "version": "type:string<br/>标识应用的版本号，便于发布到NPM时追踪应用的版本。",
  "author": "type:string<br/>作者。",
  "description": "type:string<br/>应用的简短描述。",
  "contributors": "type:array of objects<br/> 每一个对象代表一位贡献者。",
  "bin": "type:key/value object<br />可执行脚本和node.js脚本路径。" ,  
  "scripts": "type:key/value object<br />提供给NPM执行的脚本路径。",
  "main": "type:string<br/>应用的执行入口，NAE必填选项，如果不填则会默认为./index.js。",
  "keywords": "type:array of string <br/>描述关键词，发布到NPM时便于搜索。",
  "dependencies": "type:key/value object<br/>应用依赖的模块和版本。",
  "noAnalyze": "type:boolean<br/>标识应用（模块）的代码不需要任何的分析就可以使用。正常情况下可以忽略此选项。",
  "devDependencies": "type:key/value object<br/>开发模式下的模块依赖和版本，通常在此写入测试框架依赖的模块。",
  "bundleDependencies": "type:array of string<br/>已包含的模块，惯例是确认这些已包含模块在/node_modules文件夹中。<br/>同时这些模块的版本号将会固定为node_modules文件夹中模块的版本号。",
  "license": "type:string<br />开源license",
  "engine": "type:key/value object<br/>engine版本，通常会写入能够正常运行的node版本。",
  "customHost": "type:String<br />NAE特有项。<br/>要绑定的自定义域名。"
};
//pair template
var tplPair = '<span class="pair $color$" id="$key$">' +
              '<span class="key">$showKey$</span> : ' + 
              '<span class="value" id="$key$-value">$value$</span>,<br /></span>';


var appPackage = {};  //save already typed package item
var showPackage = clone(exPackage); //package to display
var error = "";       //save error (package.json's error)

var colors = {};  //save back-ground color & color for each row

var url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);

$(function(){
  getPackage();
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
          colors[key] = {color:"exsits-package"};
        }
      }
      loadDefault();
    }
  })
}
/***
 * format the value
 */
function fValue(value){
  return (JSON.stringify ({a:value})).slice(5,-1);
}
/***
*  load default info in exPackage
*/
function loadDefault(){
    var htmls = [];
  for(var key in showPackage){
    htmls.push(tplReplace(tplPair, {
      '$key$' : key,
      '$showKey$' : '"' + key + '"',
      '$value$' : fValue(showPackage[key]),
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
function showIt(value, newline){
  newline = newline || '<br />';
  return value.replace(/[\n\r]/g, '').
  replace(/[,\[\{]/g, function(data){
    return data + newline;
  }).
  replace(/[\]\}]/g, function(data){
    return newline + data;
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
      $('#submit-package').click(submit);
    }else{
      $('#submit-package').click(function(){
        sAlert('警告', '没有权限修改package.json');
      })
    }
  })
}
/***
* bind event to click on pair 
*/
function pairClick(){
    var key = $(this).attr('id');
    var showValue = fValue(showPackage[key]);
    if((showValue!==fValue(appPackage[key])&&showValue===fValue(exPackage[key]))){
      showValue = '';
    }
    var input = $('<input type=text id="'+key+'-input" style="width:300px">');
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
        bind('blur', {key:key}, checkPackage).
        keydown(function(e){
          if(e.keyCode===13){
            checkPackage.call(this, {data:{key:key}});
          } 
        });
}

function checkPackage(e) {//bind when blur
  var val = $(this).val().trim();
  var key = e.data.key;
  var spanValue = $('#' + key + '-value');
    if(val === '') {
      spanValue.html(showIt(fValue(exPackage[key])));
      $('#' + key).removeClass('exsits-package warn-package wrong-package');
      showPackage[key] = exPackage[key];
      delete appPackage[key];
    } else {
      var jsonStr = '{' + $('#' + key + ' .key').html() + ':' + val + '}';
      var wrong = false;
      var json;
      try {
        json = JSON.parse(jsonStr);
      } catch(err) {
        wrong = true;
      }
      if(wrong) {
        showPackage[key] = val;
        $('#'+key).addClass('wrong-package');
        spanValue.html(showIt(format(val)));
      } else {
        appPackage[key] = showPackage[key] = json[key];
        $('#' + key).removeClass('wrong-package warn-package').addClass('exsits-package');
        spanValue.html(showIt(fValue(json[key])));
        if(json[key].constructor !== exPackage[key].constructor){
           $('#' + key).addClass('warn-package');
        }
      }
    }
  $('#' + key).bind('click', pairClick);
}

function tofile(obj){
  newline = '\n\r';
  var tmpStrs = ['{'+newline];
  for(var key in obj){
    tmpStrs.push('"'+key+'":');
    tmpStrs.push(fValue(obj[key])+','+newline);
  }
  return tmpStrs.join('').slice(0, -3) + newline+'}';
}
function submit(){
  $.ajax({
    cache : false,
    url : "/application/manage/"+domain+"/submit/package",
    type : "POST",
    dataType : "json",
    data:{
      packageStr:tofile(appPackage),
      _csrf:_csrf
      },
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