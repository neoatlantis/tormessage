/*
 * Manages the local and remote identities.
 */
var crypto = require('../lib/crypto.js');

function IdentityManager(e){
    var self = this;

    var secret = e.config["private-key"];

    this.getLocalID = function(){
        // returns the local identity'sfingerprint.
        return ''
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(argv){
    return new IdentityManager(argv);
};
