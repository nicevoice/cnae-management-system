var ctrLabsInterface = require('../controllers/labs/labs_interface');
    
module.exports = function(app){
    app.get('/labs/appadd', ctrLabsInterface.appAdd);
    app.get('/labs/appdel', ctrLabsInterface.appDel);
}
