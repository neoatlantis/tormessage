function limitAccessWithinDarknet(e){
    e.app.use(function(req, res, next){
        var host = req.headers.host;
        if(
            !host ||
            !(
                '.onion' == host.substr(-6) ||
                '.i2p' == host.substr(-4)
            )
        ){
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
