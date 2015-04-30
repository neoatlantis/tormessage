var e = {
    config: require('../sys/config.js')(),
};

e.identity = require('../sys/identity.js')(e);

var remote = require('../sys/remote.js')(e);

/*remote.pull('hbfgpfgc55r2kqoq.onion', '/sms', {}, function(err, data){
    console.log(err, data);
});*/

remote.push('hbfgpfgc55r2kqoq.onion', '/sms', {message: 'test'}, console.log);
