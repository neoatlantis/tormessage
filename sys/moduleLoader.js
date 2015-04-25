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

            handler(e);
        };

        req.on('data', function(d){ data += d; });
        req.on('end', function(d){ if(d) data += d; work(); });
    };
};

function getUtil(express){
    var ret = {};

    ret.api = function(path, handler){
        express.post(path, getHTTPCallback(handler));
    };

    ret.page = function(path, filename){
        express.get(path, function(req, res){
            // TODO a static file server here
            res.end('hello, not done')
        });
    };


    return ret;
};

//////////////////////////////////////////////////////////////////////////////
module.exports = function(e){
    var util = getUtil(e.express);

    for(var i in list) require('../modules/' + list[i] + '/index.js')(util);
};
