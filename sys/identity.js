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
    localPublicKeyStr = crypto.util.encoding(
        localIdentity.exportPublic()
    ).toBase64();

    this.getLocalID = function(){
        // returns the local identity's fingerprint.
        return localFingerprintStr;
    };

    this.getLocalPublicKey = function(){
        // returns the local identity's public key.
        return localPublicKeyStr;
    };

    console.log('Local Identity: [' + localFingerprintStr + '].');
    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(argv){
    return new IdentityManager(argv);
};
