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
        res.setHeader(
            'X-Tor-Message-Key',
            components.identity.getLocalPublicKey()
        );

        e.response = function(code, string){
            if(respSent) return;
            res.writeHead(code);
            if(string){
                if(!util.type(string).isString())
                    string = JSON.stringify(string);
                res.end(string);
            } else {
                res.end();
            };
            respSent = true;
        };

        function work(){
            e.original = {
                data: data,
                url: req.url,
            };
            e.data = querystring.parse(data);
            e.url = url.parse(req.url);
            e.headers = req.headers;
            e.identifier = req.headers["X-Tor-Message".toLowerCase()];
            e.publicKey = req.headers["X-Tor-Message-Key".toLowerCase()];
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
        identity: components.identity,
        storage: components.storage,
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

    ret.net.page = function(path, src){
        path = '/~tormsg/' + moduleName + path;
        app.get(path, function(req, res){
            var onPageGenerated = function(err, data){
                if(err) return res.end('Page could not be served.');
                res.end(data);
            };
            if(util.type(src).isString()){
                var fn = 'modules/' + moduleName + '/static.net/' + src;
                fs.readFile(fn, onPageGenerated);
            } else {
                src(onPageGenerated);
            };
        });
    };

    // -------- `api` and `page` reserved for the user interface. `api`
    //          will be called using IPC, and `page` will be loaded using
    //          a special ipc call.

    ret.user.api = function(ipcName, callback){
        // answers IPC call using callback's return value
        ipc.on(ipcName, function(e, arg){
            callback(arg);
        });
    };
    
    var pageRegister = {};
    ret.user.page = function(pageName, src){
        // multifunctional definition.
        // if src is specified, a new register will be recorded for given
        // pageName. otherwise, the browser window will be switched to
        // specified name.
        if(undefined !== src){
            pageRegister[pageName] = src;
            return;
        } else {
            components.window.loadUrl(
                'file://' +
                __dirname + 
                '/modules/' + 
                moduleName + 
                '/static.user/' + 
                pageRegister[pageName]
            );
            return;
        };
    };


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
