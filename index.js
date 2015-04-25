var express = require('express')();




var config = require('./sys/config.js')(),
    server = require('./sys/server.js')({config: config, express: express});


var modules = require('./sys/moduleLoader.js')({
    config: config,
    express: express,
});
