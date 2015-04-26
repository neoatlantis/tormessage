var e = {
    config: require('../sys/config.js')(),
};

var remote = require('../sys/remote.js')(e);

remote.pull('hss3uro2hsxfogfq.onion', '/non-existent', {}, function(err, data){
    console.log(err, data);
});
