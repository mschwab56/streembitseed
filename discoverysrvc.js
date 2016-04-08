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

var config = require('config');
var restify = require('restify');
var util = require('util');

var logger = global.applogger;

var MAX_DISCOVERY_SEEDS = 10;

var max_seeds = MAX_DISCOVERY_SEEDS;

if (config.has('max_discovery_seeds')) {
    try {
        max_seeds = parseInt(config.get('max_discovery_seeds'));
        if (!max_seeds) {
            max_seeds = MAX_DISCOVERY_SEEDS;
        }
    }
    catch (errp) {
        max_seeds = MAX_DISCOVERY_SEEDS;
    }
}

logger.debug('max_seeds: ' + max_seeds);

function completeRequest(err, data, res, next) {
    try {
        if (err) {
            res.send(200, { error: err });
        }
        else if (!data) {
            res.send(200, { error: 'no data is available' });
        }
        else {
            res.send(200, { result: data });
        }
        return next();
    }
    catch (e) {
        res.send(200, { error: e.message });
        return next();
    }
}

var server = restify.createServer();
server
  .use(restify.fullResponse())
  .use(restify.bodyParser());


server.post('/seeds', function create(req, res, next) {
    try {
        //  return the known seeds of the network
        var error = null;
        var seeds_data = null, isprivate_network = false, private_accounts_data = [], data = null;
        
        if (!global.streemo_node) {
            throw new Error("discovery service Streembit node is not initialized");
        }
        
        if (config.has('private_network')) {
            isprivate_network = config.get('private_network');
            if (isprivate_network) {
                if (config.has('private_network_accounts')) {
                    private_accounts_data = config.get('private_network_accounts');
                }
            }
        }       
        
        // get the contact list from the Kademlia bucket
        seeds_data = global.streemo_node.get_contacts();
        var seeds = [];
            
        if (!error) {
            if (util.isArray(seeds_data)) {
                //logger.debug("seeds_data isArray. length: " + seeds_data.length);
                //logger.debug("seeds_data %j: ", seeds_data);
                for (var i = 0; i < seeds_data.length; i++) {
                    var exists = false;
                    for (var j = 0; j < seeds.length; j++) {
                        if (seeds[j].account == seeds_data[i].account && seeds[j].address == seeds_data[i].address) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        seeds.push(seeds_data[i]);
                    }
                    if (seeds.length >= max_seeds) {
                        break;
                    }
                }
            }

            data = {
                seeds: seeds,
                isprivate_network: isprivate_network,
                private_accounts: private_accounts_data
            };
        }        

        completeRequest(error, data, res, next);
    }
    catch (e) {
        try {
            completeRequest(e, null, res, next);
            logger.error(e);
        }
        catch (e) {
            console.log("fatal error in 'server.post('/seeds')' error: %j", e);
        }
    }
});


function start_server(callback) {
    //  32319 is the generic Streemo discovery port
    server.listen(32319, function () {
        logger.debug('%s listening at %s', server.name, server.url);

        callback();
    });
}

exports.start = start_server;