Validator =function(){
  this.regs = {
      email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      domain : /^([a-z])[a-z0-9_]{3,19}/,
      password : /^(.){6,}$/,
      name : /^([a-zA-Z0-9._\-]){1,20}$/,
      mobile : /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5|8)\d{9}$/,
      url : /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(:(\d)+)?(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?$/,
      githubCode : /^(git:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
      npm : /^[\w\d.-]+/,
      githubPage : /^(https:\/\/github.com\/)[\w-.]+\/[\w-_.]+/,
      imgSource : /^(https?\:\/\/|www\.)([A-Za-z0-9_\-]+\.)+[A-Za-z]{2,4}(:(\d)+)?(\/[\w\d\/=\?%\-\&_~`@\[\]\:\+\#]*([^<>\'\"\n])*)?(\.jpg|\.png|\.bmp|\.jpeg|\.gif)$/
  };
  this.verify = function(type, str){
    return this.regs[type].test(str);
  }
}
