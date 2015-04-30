var browserWindow = require('browser-window');

module.exports = function(e){
    var w = new browserWindow();
    w.show();
    return w;
};
