/*
 
This file is part of Streemio application. 
Streemio is an open source project to create a real time communication system for humans and machines. 

Streemio is a free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3.0 of the License, or (at your option) any later version.

Streemio is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Streemio software.  
If not, see http://www.gnu.org/licenses/.
 
-------------------------------------------------------------------------------------------------------------------------
Author: Tibor Zsolt Pardi 
Copyright (C) 2016 The Streemio software development team
-------------------------------------------------------------------------------------------------------------------------

*/

var config = require('config');
var restify = require('restify');

var logger = global.applogger;

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
            throw new Error("discovery service Streemio node is not initialized");
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
            
        if (!error) {
            data = {
                seeds: seeds_data,
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