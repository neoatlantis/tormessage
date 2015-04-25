var argv = {};
argv.config = require('./sys/config.js')();
argv.express = require('express');
argv.app = argv.express();


var firewall = require('./sys/firewall.js')(argv);

var server = require('./sys/server.js')(argv);
var modules = require('./sys/moduleLoader.js')(argv);
