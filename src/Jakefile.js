var fs = require('fs');
var path = require('path');
cp = require('child_process');
desc('Cnode app engine builder');

task('makeconf', function(){
  var cont = fs.readFileSync('config.json.tpl');
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

      .replace(/\$\$md5Secret\$\$/ig, 'input your login secret')//login secret
      .replace(/\$\$sessionSecret\$\$/ig, 'input your session secret')//session secret

      .replace(/\$\$domain\$\$/ig, 'cnodejs.net') //domain
      .replace(/\$\$__dir\$\$/ig, home)  //root dir

      .replace(/\$\$smtpuser\$\$/ig, 'input your gmail')  //smtp
      .replace(/\$\$smtppass\$\$/ig, 'input your gmail password')

      .replace(/\$\$uploadDir\$\$/ig, path.dirname(home)+'/cnode-app-engine/apps')//apps dir

      .replace(/\$\$slabs\$\$/ig, 'false')
      .replace(/\$\$sdebug\$\$/ig, 'false')
      .replace(/\$\$sdaily\$\$/ig, 'false')
      .replace(/\$\$snoGit\$\$/ig, 'false')

      .replace(/\$\$labsHost\$\$/ig, 'dev.labs.taobao.com') //labs info
      .replace(/\$\$tbSecret\$\$/ig, 'input tb secret')
  );
});
task('cleanup', function(){
  try {
    fs.unlinkSync('config.json');
  } catch(e) {

  }
});