console.log('------------------------------');


var argv = {};
argv.config = require('./sys/config.js')();
argv.events = require('./sys/eventCenter.js')();
argv.express = require('express');
argv.app = argv.express();
argv.remote = require('./sys/remote.js')(argv);
argv.identity = require('./sys/identity.js')(argv);
argv.storage = require('./sys/storage.js')(argv);


var firewall = require('./sys/firewall.js')(argv);

var server = require('./sys/server.js')(argv);

var modules = require('./sys/moduleLoader.js')(argv);
