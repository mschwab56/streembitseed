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

var assert = require('assert');
var config = require('./config');
var wotkad = require('streembitlib/kadlib');
streembit.account = require("./account");

var DEFAULT_STREEMBIT_PORT = 32320;


streembit.PeerNet = (function (thisobj, logger, events) {
    
    thisobj.node = 0;
    
    function onTransportError(err) {
        logger.error('RPC error: %j', err);
    }
    
    thisobj.start = function (streembitdb, callback) {
        try {

            logger.info('Bootstrap P2P network');
            
            assert(config.node.address, "address must exists in the config field of config.json file");
            assert(config.node.port, "port must exists in the config field of config.json file");
            assert(streembit.account.name, "account name must be initialized");
            assert(streembit.account.public_key, "account public key must be initialized");
            
            var contact = wotkad.contacts.StreembitContact({
                address: config.node.address,
                port: config.node.port,
                account: streembit.account.name,
                public_key: streembit.account.public_key
            });
            var transport = wotkad.transports.TCP(contact);
            
            transport.after('open', function (next) {
                // exit middleware stack if contact is blacklisted
                logger.info('TCP peer connection is opened');
                
                // otherwise pass on
                next();
            });
            
            // handle errors from RPC
            transport.on('error', onTransportError);
            
            var options = {
                transport: transport,
                logger: logger,
                storage: streembitdb,
                seeds: config.node.seeds
            };
            
            wotkad.create(options, function (err, peer) {
                if (err) {
                    return callback(err);
                }
                
                thisobj.node = peer;
                callback();
            });   

            //
            //
        }
        catch (err) {
            callback("P2P handler start error " + err.message);
        }
    }
    
    return thisobj;
    
}(streembit.PeerNet || {}, global.applogger, global.appevents));


module.exports = streembit.PeerNet;