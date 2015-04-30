function storage(e){
    var self = this;

    var fs = require('fs'),
        buffer = require('buffer'),
        path = require('path');

    function getPath(filename){
        return path.resolve(e.config.storage, filename);
    };

    function save(key, data, callback){
        if(3 != arguments.length)
            return callback('Invalid storage arguments count.');
        if(!/^(kv|list)_[0-9a-zA-Z\.\-]+$/.test(key))
            return callback('Storage key invalid.');
        var filename = getPath(key),
            filedata = new buffer.Buffer(JSON.stringify(data), 'utf-8');
        fs.writeFile(filename, filedata, callback);
        callback(null);
    };

    function read(key, callback){
        if(2 != arguments.length)
            return callback('Invalid storage arguments count.');
        if(!/^(kv|list)_[0-9a-zA-Z\.\-]+$/.test(key))
            return callback('Storage key invalid.');
        var filename = getPath(key);
        fs.readFile(filename, function(err, data){
            if(err){
                return callback('Storage reading failure: no such key.');
            };
            try{
                var got = JSON.parse(data.toString('utf-8'));
            } catch(e){
                return callback('Storage reading failure: invalid content.');
            };
            return callback(null, got);
        });
    };


    this.kv = {};
    this.kv.set = function(key, data, callback){
        if(!callback) callback = function(){};
        save('kv_' + key, data, callback);
    };
    this.kv.get = function(key, callback){
        read('kv_' + key, callback);
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////
module.exports = function(e){
    return new storage(e);    
};
