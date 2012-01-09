var fs = require('fs');
var path = require('path');
cp = require('child_process');
desc('Cnode app engine builder');

task('makeconf', function(){
  var cont = fs.readFileSync(__dirname + '/config.json.tpl');
  var home = path.dirname(__dirname);
  fs.writeFileSync(
    'config.json',
    cont.toString()
      .replace(/\s*\#\#.+$/igm, '')//clear '///'

      .replace(/\$\$dbName\$\$/ig, 'naeweb')//dbinfo
      .replace(/\$\$dbUserName\$\$/ig, '')
      .replace(/\$\$dbPassword\$\$/ig, '')  
      .replace(/\$\$user\$\$/ig, 'user')  
      .replace(/\$\$app_member\$\$/ig, 'member')  
      .replace(/\$\$app_basic\$\$/ig, 'basic')  
      .replace(/\$\$app_record\$\$/ig, 'record')
      //app db info
      .replace(/\$\$appDbUserName\$\$/ig, '')
      .replace(/\$\$appDbPassword\$\$/ig, '')
      .replace(/\$\$appDbPort\$\$/ig, '20088')
      
      .replace(/\$\$redisPassword\$\$/ig, 'input your redis password')
      
      .replace(/\$\$md5Secret\$\$/ig, 'input your login secret')//login secret
      .replace(/\$\$sessionSecret\$\$/ig, 'input your session secret')//session secret

      .replace(/\$\$domain\$\$/ig, 'cnodejs.net') //domain
      .replace(/\$\$__dir\$\$/ig, home)  //root dir

      .replace(/\$\$smtpuser\$\$/ig, 'input your gmail')  //smtp
      .replace(/\$\$smtppass\$\$/ig, 'input your gmail password')

      .replace(/\$\$uploadDir\$\$/ig, path.dirname(home)+'/cnode-app-engine/apps')//apps dir
      .replace(/\$\$tempDir\$\$/ig, home+'/temp')//temp dir

      .replace(/\$\$slabs\$\$/ig, 'false')
      .replace(/\$\$sdebug\$\$/ig, 'false')
      .replace(/\$\$sdaily\$\$/ig, 'false')
      .replace(/\$\$snoGit\$\$/ig, 'false')

      .replace(/\$\$labsHost\$\$/ig, 'dev.labs.taobao.com') //labs info
      .replace(/\$\$labsPort\$\$/ig, '80')  
      .replace(/\$\$tbSecret\$\$/ig, 'input tb secret')

      //git dirs
      .replace(/\$\$keyDir\$\$/ig, '/home/heyiyu.pt/.ssh/nae/id_rsa_')
      .replace(/\$\$configDir\$\$/ig, '/home/heyiyu.pt/.ssh/config')
  );
});
task('maketestconf', function(){
  var cont = fs.readFileSync(__dirname + '/config.json.tpl');
  var home = path.dirname(__dirname);
  var testDir = home + '/test';
  var temp = testDir + '/temp';
//mkdir
  try{
  fs.mkdirSync(temp, '777');
  fs.mkdirSync(temp + '/apps', '777');
  fs.mkdirSync(temp + '/key', '777');
  fs.mkdirSync(temp + '/temp', '777');
  }catch(err){}
  fs.writeFileSync(
    'config.test.json',
    cont.toString()
      .replace(/\s*\#\#.+$/igm, '')//clear '///'

      .replace(/\$\$dbName\$\$/ig, 'naeweb_test')//dbinfo
      .replace(/\$\$dbUserName\$\$/ig, '')
      .replace(/\$\$dbPassword\$\$/ig, '')  
      .replace(/\$\$user\$\$/ig, 'user')  
      .replace(/\$\$app_member\$\$/ig, 'member')  
      .replace(/\$\$app_basic\$\$/ig, 'basic')  
      .replace(/\$\$app_record\$\$/ig, 'record')
      //app db info
      .replace(/\$\$appdbUserName\$\$/ig, '')
      .replace(/\$\$appdbPassword\$\$/ig, '')
      .replace(/\$\$appDbPort\$\$/ig, '27017')

      .replace(/\$\$redisPassword\$\$/ig, '')
      
      .replace(/\$\$md5Secret\$\$/ig, 'input your login secret')//login secret
      .replace(/\$\$sessionSecret\$\$/ig, 'input your session secret')//session secret

      .replace(/\$\$domain\$\$/ig, 'cnodejs.net') //domain
      .replace(/\$\$__dir\$\$/ig, home)  //root dir

      .replace(/\$\$smtpuser\$\$/ig, 'input your gmail')  //smtp
      .replace(/\$\$smtppass\$\$/ig, 'input your gmail password')

      .replace(/\$\$uploadDir\$\$/ig, temp+'/apps')//apps dir
      .replace(/\$\$tempDir\$\$/ig, temp+'/temp')//temp dir
      .replace(/\$\$slabs\$\$/ig, 'false')
      .replace(/\$\$sdebug\$\$/ig, 'true')
      .replace(/\$\$sdaily\$\$/ig, 'false')
      .replace(/\$\$snoGit\$\$/ig, 'false')

      .replace(/\$\$labsHost\$\$/ig, 'localhost') //labs info
      .replace(/\$\$labsPort\$\$/ig, '1129')  
      .replace(/\$\$tbSecret\$\$/ig, 'input tb secret')

      .replace(/\$\$gitKey\$\$/ig, temp+'/key/id_rsa_')
      .replace(/\$\$gitConfig\$\$/ig, temp+'/key/config')
      .replace(/\$\$shells\$\$/, home+'/src/shells')
  );
});
task('cleanup', function(){
  try {
    fs.unlinkSync('config.json');
  } catch(e) {

  }
});
