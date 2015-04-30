function storage(e){
    var self = this;

    var fs = require('fs'),
        buffer = require('buffer'),
        path = require('path'),
        crypto = require('../lib/crypto.js');

    function getPath(filename){
        return path.resolve(e.config.storage, filename);
    };

    function testFilename(filename){
        return /^(kv|(list_[0-9a-z]+))_[0-9a-zA-Z\.\-]+$/.test(filename);
    };

    function save(key, data, callback){
        if(3 != arguments.length)
            return callback('Invalid storage arguments count.');
        if(!testFilename(key)) return callback('Storage key invalid.');
        var filename = getPath(key),
            filedata = new buffer.Buffer(JSON.stringify(data), 'utf-8');
        fs.writeFile(filename, filedata, callback);
        callback(null);
    };

    function read(key, callback){
        if(2 != arguments.length)
            return callback('Invalid storage arguments count.');
        if(!testFilename(key)) return callback('Storage key invalid.');
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


    this.list = function(name){
        var ret = {};
        ret.all = function(callback){
            fs.readdir(getPath('.'), function(err, files){
                if(err) return callback('Storage reading list failure.');
                var filter = [], prefix = 'list_' + name + '_';
                for(var i in files){
                    if(!testFilename(files[i])) continue;
                    if(prefix == files[i].substr(0, prefix.length)){
                        filter.push(files[i].substr(prefix.length));
                    };
                };
                filter.sort();
                callback(null, filter);
            });
        };
        ret.set = function(data, callback){
            if(!callback) callback = function(){};
            var key = crypto.util.uuid();
            save('list_' + name + '_' + key, data, callback);
        };
        ret.get = function(key, callback){
            read('list_' + name + '_' + key, callback);
        };
        return ret;
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////
module.exports = function(e){
    return new storage(e);    
};
