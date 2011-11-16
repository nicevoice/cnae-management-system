var ctrLabsInterface = require('../controllers/labs/labs_interface'),
    ctrCommandLine = require('../controllers/commandLine.js')
    labs = require('../config').switchs.labs;
    
module.exports = function(app){
    if(labs){
        app.get('/labs/appadd', ctrLabsInterface.appAdd);
        app.get('/labs/appdel', ctrLabsInterface.appDel);
    }
    app.get('/commandline/token', ctrCommandLine.getToken);
}
