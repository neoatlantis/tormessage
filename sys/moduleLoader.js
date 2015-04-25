var list = [
    'sms',
];
//////////////////////////////////////////////////////////////////////////////

function getHTTPCallback(handler){
    return function(req, res){
        var e = {};
        var data = '', respSent = false;

        var querystring = require('querystring'),
            url = require('url');

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
            console.log(e);
            handler(e);
        };

        req.on('data', function(d){ data += d; });
        req.on('end', function(d){ if(d) data += d; work(); });
    };
};

function getUtil(moduleName, components){
    var app = components.app;
    var fs = require('fs');

    var ret = {user: {}, net: {}};

    // -------- `api` and `page` will be exposed to the internet(or Tor
    //          network).

    ret.net.api = function(path, handler){
        path = '/' + moduleName + path;
        app.post(path, getHTTPCallback(handler));
    };

    ret.net.page = function(path, filename){
        path = '/' + moduleName + path;
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
    for(var i in list) 
        require('../modules/' + list[i] + '/index.js')(getUtil(list[i], e));
};
