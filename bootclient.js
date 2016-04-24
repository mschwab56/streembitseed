/*

This file is part of Streembit application. 
Streembit is an open source project to create a real time communication system for humans and machines. 

Streembit is a free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3.0 of the License, or (at your option) any later version.

Streembit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Streembit software.  
If not, see http://www.gnu.org/licenses/.
 
-------------------------------------------------------------------------------------------------------------------------
Author: Tibor Zsolt Pardi 
Copyright (C) 2016 The Streembit software development team
-------------------------------------------------------------------------------------------------------------------------

*/

'use strict';

var streembit = streembit || {};

var net = require('net');

streembit.bootclient = (function (client, logger, config, events) {

    client.discovery = function(seed, fn) {
        var client = net.connect( 
            {
                port: seed.port, 
                host: seed.address
            },
            function () {
                client.write(JSON.stringify({ type: 'DISCOVERY' }));
            }
        );
        
        client.on('data', function (data) {
            client.end();
            var reply = JSON.parse(data.toString());
            if (reply && reply.address) {
                var ipv6prefix = "::ffff:";
                if (reply.address.indexOf(ipv6prefix) > -1) {
                    reply.address = reply.address.replace(ipv6prefix, '');
                }

                fn(null, reply.address);
            }
            else {
                fn("discovery failed for " + seed.address + ":" + seed.port);
            }
        });
        
        client.on('end', function () {
        });
        
        client.on('error', function (err) {
            fn("self discovery failed with " + seed.address + ":" + seed.port + ". " + (err.message ? err.message : err));
        });
    };
    
    return client;

}(streembit.bootclient || {}));


module.exports = streembit.bootclient;