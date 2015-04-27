module.exports = function(){ return {
//////////////////////////////////////////////////////////////////////////////
    "port": 9393,
    "private-key": "Change this and keep this configuration file secure!",
    "darknet": {
        "tor": {
            "ip": "127.0.0.1",
            "port": 9150,
        },
        "i2p": false,
    },
    "darknet-admin": {
        "enabled": true,
        "username": "username",
        "password": "password",
    },
    "modules": {
        "sms": {
            "message-length-limit": 1024,
        },
    },
//////////////////////////////////////////////////////////////////////////////
}; };
