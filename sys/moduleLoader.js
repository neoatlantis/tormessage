var util = require('../lib/util.js');
//////////////////////////////////////////////////////////////////////////////

function getHTTPCallback(handler, components){
    return function(req, res){
        var e = {};
        var data = '', respSent = false;

        var querystring = require('querystring'),
            url = require('url');

        // identity this service
        res.setHeader('X-Tor-Message', components.identity.getLocalID());

        e.response = function(code, string){
            if(respSent) return;
            res.writeHead(code);
            res.end(string);
        };

        function work(){
            e.original = {
                data: data,
                url: req.url,
            };
            e.data = querystring.parse(data);
            e.url = url.parse(req.url);
            e.headers = req.headers;
            e.identifier = req.headers["X-Tor-Message"];
            handler(e);
        };

        req.on('data', function(d){ data += d; });
        req.on('end', function(d){ if(d) data += d; work(); });
    };
};

function getUtil(moduleName, components){
    var app = components.app;
    var fs = require('fs');

    var ret = {
        user: {},
        net: {},
        events: components.events,
        config: {},
        util: util,
    };

    // -------- set config parameters for this module

    if(
        components.config.modules[moduleName] && 
        true !== components.config.modules[moduleName]
    )
        ret.config = components.config.modules[moduleName];
    else if('admin' == moduleName)
        ret.config = components.config["darknet-admin"];

    // -------- `api` and `page` will be exposed to the internet(or Tor
    //          network).

    ret.net.api = function(path, handler){
        path = '/~tormsg/' + moduleName + path;
        app.post(path, getHTTPCallback(handler, components));
    };

    ret.net.page = function(path, filename){
        path = '/~tormsg/' + moduleName + path;
        app.get(path, function(req, res){
            var fn = 'modules/' + moduleName + '/static.net/' + filename;
            fs.readFile(fn, function(err, data){
                if(err) return res.end('Page could not be served.');
                res.end(data);
            });
        });
    };

    // -------- `api` and `page` reserved for the user interface. `api`
    //          will be called using IPC, and `page` will be loaded using
    //          a special ipc call.


    return ret;
};

//////////////////////////////////////////////////////////////////////////////
module.exports = function(e){
    for(var moduleName in e.config.modules){
        console.log("Loading module [" + moduleName + "]...");
        require('../modules/' + moduleName + '/index.js')(
            getUtil(moduleName, e)
        );
    };

    if(e.config["darknet-admin"] && e.config["darknet-admin"].enabled){
        console.log("Admin from Darknet is enabled. Loading module...");
        require('../modules/admin/index.js')(getUtil('admin', e));
    };
};
