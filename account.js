/*
 
This file is part of Streembit application. 
Streembit is an open source project to create a real time communication system for humans and machines. 

Streembit is a free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3.0 of the License, or (at your option) any later version.

Streembit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Streembit software.  
If not, see http://www.gnu.org/licenses/.
 
-------------------------------------------------------------------------------------------------------------------------
Author: Tibor Zsolt Pardi 
Copyright (C) 2016 The Streembit software development team
-------------------------------------------------------------------------------------------------------------------------

*/


'use strict';

var streembit = streembit || {};

var async = require("async");
var nodecrypto = require(global.cryptolib);
var EccKey = require('streembitlib/crypto/EccKey');
var secrand = require('secure-random');
streembit.config = require("./config.json");

streembit.account = (function (accountobj, logger) {
    
    var m_name = null;
    var key = null;
    var ecdhkey = null;
    var m_port = null;
    var m_address = null;
    var m_ecdhkeys = null;
    var m_lastpkey = null;
    
    Object.defineProperty(accountobj, "name", {
        get: function () {
            return m_name;
        },
        
        set: function (value) {
            m_name = value;
        }
    });
    
    Object.defineProperty(accountobj, "port", {
        get: function () {
            return m_port;
        },
        
        set: function (value) {
            m_port = value;
        }
    });
    
    Object.defineProperty(accountobj, "address", {
        get: function () {
            return m_address;
        },
        
        set: function (value) {
            m_address = value;
        }
    });
    
    Object.defineProperty(accountobj, "crypto_key", {
        get: function () {
            return key;
        },
        
        set: function (value) {
            key = value;
        }
    });
    
    Object.defineProperty(accountobj, "private_key", {
        get: function () {
            return key ? key.privateKey : '';
        }
    });
    
    Object.defineProperty(accountobj, "ecdh_key", {
        get: function () {
            return ecdhkey;
        },
        
        set: function (value) {
            ecdhkey = value;
        }
    });
    
    Object.defineProperty(accountobj, "ecdh_public_key", {
        get: function () {
            return ecdhkey ? ecdhkey.getPublicKey('hex') : '';
        }
    });
    
    Object.defineProperty(accountobj, "ecdh_private_key", {
        get: function () {
            return ecdhkey ? ecdhkey.getPrivateKey('hex') : '';
        }
    });
    
    Object.defineProperty(accountobj, "public_key", {
        get: function () {
            return key ? key.publicKeyStr : '';
        }
    });
    
    Object.defineProperty(accountobj, "last_public_key", {
        get: function () {
            return m_last_key;
        },
        
        set: function (value) {
            m_last_key = value;
        }
    });
    
    Object.defineProperty(accountobj, "is_user_initialized", {
        get: function () {
            var isuser = m_name && key && ecdhkey;
            return isuser ? true : false;
        }
    });
    
    Object.defineProperty(accountobj, "ecdhkeys", {
        get: function () {
            return m_ecdhkeys;
        },
        
        set: function (value) {
            m_ecdhkeys = value;
        }
    });
    
    function getCryptPassword(password) {
        if (!password) {
            throw new Error("invalid password")    
        }

        var salt = nodecrypto.createHash('sha1').update(password).digest().toString('hex');
        var pbkdf2key = nodecrypto.pbkdf2Sync(password, salt, 100, 64, 'sha512');
        var pwdhex = pbkdf2key.toString('hex');
        return pwdhex;
    }
    
    accountobj.create = function (password, callback) {
        try {
            
            if (!password) {
                throw new Error("password is required")
            }
            
            var entropy = nodecrypto.createHash('sha256').update(password).digest('hex');

            // get an entropy for the ECC key
            //var entropy = secrand.randomBuffer(32).toString("hex");            
            // create ECC key
            var key = new EccKey(entropy);
            
            // create a ECDH key
            var ecdh_key = nodecrypto.createECDH('secp256k1');
            ecdh_key.generateKeys();

            var ecdhkeys =  [];
            ecdhkeys.push({
                ecdh_private_key: ecdh_key.getPrivateKey('hex'),
                ecdh_public_key: ecdh_key.getPublicKey('hex')
            });
            
            // set the PPKI key
            accountobj.crypto_key = key;

            // account is the hash of the pkey
            var account = nodecrypto.createHash('sha1').update(this.public_key).digest('hex');
            accountobj.name = account;

            accountobj.ecdh_key = ecdh_key;            
            accountobj.ecdhkeys = ecdhkeys;
            
            callback();
        }
        catch (err) {
            callback("create_account error: " + err.message);
        }
    };

    accountobj.clear = function () {
        accountobj.crypto_key = null;
        accountobj.name = null;
        accountobj.ecdh_key = null;
    }
    
    return accountobj;

}(streembit.account || {}, global.applogger ));

module.exports = streembit.account;