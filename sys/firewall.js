function limitAccessWithinDarknet(e){
    e.app.use(function(req, res, next){
        var host = req.headers.host;

        function validateSourceIP(againstProxyIP){
            // make sure that the request really comes from the darknet proxy.
            var ip = req.socket.remoteAddress;
            return ip == againstProxyIP || ip == '::ffff:' + againstProxyIP;
        };

        var accessingFromDarknet = (
            Boolean(host) &&
            (
                (
                    Boolean(e.config.darknet.tor) && 
                    validateSourceIP(e.config.darknet.tor.ip) &&
                    '.onion' == host.substr(-6)
                ) ||
                (
                    Boolean(e.config.darknet.i2p) &&
                    validateSourceIP(e.config.darknet.i2p.ip) &&
                    '.i2p' == host.substr(-4)
                )
            )
        );

        if(!accessingFromDarknet){
            res.writeHead(403);
            res.end('Access limited to Darknet.');
            return;
        };
        next();
    });
};

function forceWWWAuthOnAdmin(e){
    var adminPath = '/admin';
    var mayAccess = (
        e.config["darknet-admin"] && 
        true === e.config["darknet-admin"].enabled
    );

    if(!mayAccess){
        e.app.use(adminPath, function(req, res){
            res.writeHead(403);
            res.end("Access denied.");
        });
        return;
    };

    var basicAuth = require('basic-auth-connect');
    e.app.use(adminPath, basicAuth(
        e.config["darknet-admin"].username,
        e.config["darknet-admin"].password
    ));
};


module.exports = function(e){
    limitAccessWithinDarknet(e);
    forceWWWAuthOnAdmin(e);
};
