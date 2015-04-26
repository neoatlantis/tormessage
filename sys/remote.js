/*
 * Provides push/pull tools for accessing a remote friend's service.
 */

var curl = require('node-curl'),
    querystring = require('querystring');

module.exports = function(e){
    var ret ={};

    function configureOption(opt, dest, path, data, callback){
        opt.URL = getURL(dest, path);
        opt.TIMEOUT = 20;

        // config proxy use
        if('.onion' == dest.substr(-6)){
            if(!e.config.darknet.tor){
                callback('tor-unavailable');
                return false;
            };
            // use prefix `socks5h` to enable remote hostname resolving
            opt.PROXY = "socks5h://" + e.config.darknet.tor.ip;
            opt.PROXYPORT = e.config.darknet.tor.port;
        } else if('.i2p' == dest.substr(-4)){
            if(!e.config.darknet.i2p){
                callback('i2p-unavailable');
                return false;
            };
            // use prefix `socks5h` to enable remote hostname resolving
            opt.PROXY = "socks5h://" + e.config.darknet.i2p.ip;
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
        var curlCallback = function(err){
            var failed = false, retry = true;
            var statusCode = this.status;

            // judge if this is an error, and if another try is ok.
            if(err) failed = true; // if curl returned an error
            if(statusCode >= 400){
                failed = true;
                if(statusCode < 500) retry = false;
                error = statusCode;
            };
            
            // if failed, may try again.
            if(failed){
                console.log(err, url, opt);
                failedTimes += 1;
                if(failedTimes > maxTimes || !retry) return callback(err);
                return curl(url, opt, curlCallback);
            };

            // if successful. callback with things we have got.
            var data = {};
            data.body = this.body;
            data.statusCode = statusCode;
            data.header = this.header;
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
