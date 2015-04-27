/*
 * Provides push/pull tools for accessing a remote friend's service.
 */

var querystring = require('querystring'),
    child_process = require('child_process');

function curl(url, opt, callback){
    var argv = [], spawn = child_process.spawn;

    // set verbose output
    argv.push('-v');
    // set http header for identifying ourselves
    if(opt.IDENTIFIER){
        argv.push('--header');
        argv.push('X-Tor-Message: ' + opt.IDENTIFIER);
    };
    if(opt.PUBLICKEY){
        argv.push('--header');
        argv.push('X-Tor-Message-Key: ' + opt.PUBLICKEY);
    };
    // set proxy
    argv.push('--proxy');
    argv.push('socks5h://' + opt.PROXY + ':' + opt.PROXYPORT);
    // set postfield
    if(opt.POSTFIELDS){
        argv.push('--data');
        argv.push(opt.POSTFIELDS);
    };
    // add url
    argv.push(url);

                                                                                    console.log('curl', argv.join(' '));
    var proc = spawn('curl', argv);
    var stdout = '', stderr = '';
    proc.stdout.on('data', function(d){ stdout += d; });
    proc.stderr.on('data', function(d){ stderr += d; });
    proc.on('close', function(code){
        if(0 != code) return callback(code);

        var stderrLines = stderr.split('\n'), headerRecv = [], newLine;
        for(var i in stderrLines){
            if('<' != stderrLines[i].substr(0, 1)) continue;
            newLine = stderrLines[i].substr(2).trim();
            if('' == newLine) continue;
            headerRecv.push(newLine);
        };

        try{
            var firstLine = headerRecv.shift().split(' ');
            var statusCode = parseInt(firstLine[1], 10);
            var headers = {}, split = 0, key;
            for(var i in headerRecv){
                split = headerRecv[i].indexOf(': ');
                if(split < 0) continue;
                key = headerRecv[i].substr(0, split);
                headers[key] = headerRecv[i].substr(split + 2);
            };
        } catch(e){
            return callback(false);
        };
        var ret = {
            body: stdout,
            headers: headers,
            statusCode: statusCode
        };
        return callback(null, ret);
    });
};


module.exports = function(e){
    var ret ={};

    function configureOption(opt, dest, path, data, callback){
        opt.URL = getURL(dest, path);
        opt.TIMEOUT = 20;
        opt.IDENTIFIER = e.identity.getLocalID();
        opt.PUBLICKEY = e.identity.getLocalPublicKey();

        // config proxy use
        if('.onion' == dest.substr(-6)){
            if(!e.config.darknet.tor){
                callback('tor-unavailable');
                return false;
            };
            // use prefix `socks5h` to enable remote hostname resolving
            opt.PROXY = e.config.darknet.tor.ip;
            opt.PROXYPORT = e.config.darknet.tor.port;
        } else if('.i2p' == dest.substr(-4)){
            if(!e.config.darknet.i2p){
                callback('i2p-unavailable');
                return false;
            };
            // use prefix `socks5h` to enable remote hostname resolving
            opt.PROXY = e.config.darknet.i2p.ip;
            opt.PROXYPORT = e.config.darknet.i2p.port;
        } else {
            callback('invalid-destination');
            return false;
        };

        return true;
    };

    function getURL(dest, path){
        return 'http://' + dest + '/~tormsg' + path; // hardcoded namespace
    };

    function tryCurl(url, opt, callback){
        var maxTimes = 10, failedTimes = 0;
        var curlCallback = function(err, result){
            var failed = false, retry = true;

            // judge if this is an error, and if another try is ok.
            if(err)
                failed = true; // if curl returned an error
            else {
                var statusCode = result.statusCode;
                if(statusCode >= 400){
                    failed = true;
                    if(statusCode < 500) retry = false;
                    err = statusCode;
                };
            };
            
            // if failed, may try again.
            if(failed){
                failedTimes += 1;
                if(failedTimes > maxTimes || !retry) return callback(err);
                return curl(url, opt, curlCallback);
            };

            // if successful. callback with things we have got.
            var data = {};
            data.body = result.body;
            data.statusCode = statusCode;
            data.headers = result.headers;
            try{
                data.bodyJSON = JSON.parse(data.body);
            } catch(e){
                data.bodyJSON = null;
            };
            return callback(null, data);
        };
        curl(url, opt, curlCallback); // start initial attempt.
    };

    // -------- used for pushing data to a remote destination

    ret.push = function(dest, path, data, callback){
        var opt = {};
        if(!configureOption(opt, dest, path, data, callback)) return;
        opt.POSTFIELDS = querystring.stringify(data);
        tryCurl(getURL(dest, path), opt, callback);
    };

    // -------- used for pulling data

    ret.pull = function(dest, path, data, callback){
        var opt = {};
        var qstr = querystring.stringify(data);
        if(qstr) path += '?' + qstr;
        if(!configureOption(opt, dest, path, null, callback)) return;
        tryCurl(getURL(dest, path), opt, callback);
    };


    return ret;
};
