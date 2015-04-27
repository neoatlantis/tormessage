module.exports = function(e){ 
    
    // -------- require `new.js` for registering the corresponding event into
    //          system bus
    
    require('./new.js')(e);
    
    // -------- provide a not so useful darknet http page

    e.net.page('/', 'sms.html');

    // -------- provides the API for receiving new message drop-in

    e.net.api('/', function(res){
        var data = res.data;

        var message = data.message, identifier = res.identifier;
        if(!(
            e.util.type(message).isString() &&
            e.util.type(identifier).isString()
        )){
            return res.response(400);
        };

        if( message.length > e.config["message-length-limit"] ){
            return res.response(413); // POSTed too long
        };

        // emit data to event bus
        e.events.emit('sms.received', {
            message: message,
            identifier: identifier,
        });

        res.response(200, 'Thank you.');
    });

};
