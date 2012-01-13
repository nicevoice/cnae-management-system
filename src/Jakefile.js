var fs = require('fs');
var path = require('path');
cp = require('child_process');
desc('Cnode app engine builder');

task('makeconf', function(){
  var cont = fs.readFileSync(__dirname + '/config.json.tpl');
  var home = path.dirname(__dirname);
  try{
    fs.mkdirSync(__dirname+'/download');
  }catch(err){}
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
      
      .replace(/\$\$redisPassword\$\$/ig, '')
      
      .replace(/\$\$md5Secret\$\$/ig, 'input your login secret')//login secret
      .replace(/\$\$sessionSecret\$\$/ig, 'input your session secret')//session secret

      .replace(/\$\$domain\$\$/ig, 'cnodejs.net') //domain

      .replace(/\$\$mailUser\$\$/ig, '')  //smtp
      .replace(/\$\$mailPasswrod\$\$/ig, '')

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
      .replace(/\$\$githubKeyDir\$\$/ig, '/home/admin/.ssh/nae/id_rsa_')
      .replace(/\$\$githubConfig\$\$/ig, '/home/admin/.ssh/config')
  );
});
task('maketestconf', function(){
  var cont = fs.readFileSync(__dirname + '/config.json.tpl');
  var home = path.dirname(__dirname);
  var testDir = home + '/test';
  var temp = testDir + '/temp';
//mkdir
  try{
    fs.mkdir(temp+'/apps');
  }catch(err){}
  try{
    fs.mkdir(temp+'/key');
  }catch(err){}
  try{
    fs.mkdir(temp+'/temp');
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

      .replace(/\$\$mailUser\$\$/ig, 'input your gmail')  //smtp
      .replace(/\$\$mailPassword\$\$/ig, 'input your gmail password')

      .replace(/\$\$uploadDir\$\$/ig, temp+'/apps')//apps dir
      .replace(/\$\$tempDir\$\$/ig, temp+'/temp')//temp dir

      .replace(/\$\$slabs\$\$/ig, 'false')
      .replace(/\$\$sdebug\$\$/ig, 'true')
      .replace(/\$\$sdaily\$\$/ig, 'false')
      .replace(/\$\$snoGit\$\$/ig, 'false')

      .replace(/\$\$labsHost\$\$/ig, 'localhost') //labs info
      .replace(/\$\$labsPort\$\$/ig, '1129')  
      .replace(/\$\$tbSecret\$\$/ig, 'input tb secret')

      .replace(/\$\$githubKeyDir\$\$/ig, temp+'/key/id_rsa_')
      .replace(/\$\$githubConfig\$\$/ig, temp+'/key/config')
  );
});
task('cleanup', function(){
  try {
    fs.unlinkSync('config.json');
    fs.unlikSync('config.test.json');
  } catch(e) {

  }
});
