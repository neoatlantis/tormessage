/*
 * Manages the local and remote identities.
 */
var crypto = require('../lib/crypto.js');

function IdentityManager(e){
    var self = this;

    var secret = e.config["private-key"];
    var localIdentity = crypto.enigma.identity(), localFingerprintStr;

    localIdentity.generate('Another Tor Message User', {
        overrideSecret: secret,
    });
    localFingerprintStr = localIdentity.getFingerprint(true);

    this.getLocalID = function(){
        // returns the local identity'sfingerprint.
        return localFingerprintStr;
    };

    console.log('Local Identity: [' + localFingerprintStr + '].');
    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(argv){
    return new IdentityManager(argv);
};
