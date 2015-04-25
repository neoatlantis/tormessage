var events = require('events');
var bus = new events.EventEmitter();

module.exports = function(){
    return bus;
};
