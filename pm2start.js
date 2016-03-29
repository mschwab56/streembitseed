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


var async = require("async");
var pm2 = require('pm2');

pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }
    
    var pm2config = {
        name    : "streemio",
        script  : 'streemio.js',         
        cwd     : "/home/zsoltp/apps/streemio-seed",
        env: {
            "NODE_CONFIG_DIR": "/home/zsoltp/apps/streemio-seed/config"
        }
    };
    
    pm2.start(
        pm2config, 
        function (err, apps) {
            if (err) {
                return console.log("pm2.start error: %j", err);
            }
            
            console.log("pm2.start complete");
            process.exit(0);      
        }
    );    
    
});