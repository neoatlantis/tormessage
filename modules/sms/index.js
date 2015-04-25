module.exports = function(e){ 
    
    // -------- require `new.js` for registering the corresponding event into
    //          system bus
    
    require('./new.js')(e);
    
    // -------- provide a not so useful darknet http page

    e.net.page('/', 'sms.html');

    // -------- provides the API for receiving new message drop-in

    e.net.api('/', function(res){
        var data = res.data;

        // TODO validate data

        // emit data to event bus
        e.events.emit('sms.received', res.data);

        res.response(200, 'hello');
    });

};
