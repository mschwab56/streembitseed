/*
 
Streemo - Real time communication system for humans and machines

Copyright (C) 2016 T. Z. Pardi

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as 
published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

*/


var async = require("async");
var pm2 = require('pm2');

pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    async.waterfall(
        [
            function (callback) {                
                pm2.start({
                    name    : "streemio seed #1",
                    script  : 'streemio.js',         
                    cwd     : "/home/zsoltp/apps/streemio-seed",
                    env: {
                        "NODE_CONFIG_DIR": "/home/zsoltp/apps/streemio-seed/config"
                    }
                }, 
                function (err, apps) {
                    callback(err);
                });                
            },
            function (callback) {
                //setTimeout(
                //    function () {
                //        pm2.start({
                //            name    : "streemio seed #2",
                //            script  : 'streemio.js',         
                //            cwd     : "/home/zsoltp/apps/seed2",
                //            env: {
                //                "NODE_CONFIG_DIR": "/home/zsoltp/apps/streemio-seed2/config"
                //            }
                //        }, 
                //        function (err, apps) {
                //            callback(err);
                //        });             
                //    },
                //    5000
                //);
                callback();
            },
            function (callback) {
                //setTimeout(
                //    function () {
                //        pm2.start({
                //            name    : "streemio seed #3",
                //            script  : 'streemio.js',         
                //            cwd     : "/home/zsoltp/apps/seed3",
                //            env: {
                //                "NODE_CONFIG_DIR": "/home/zsoltp/apps/streemio-seed3/config"
                //            }
                //        }, 
                //        function (err, apps) {
                //            callback(err);
                //        });
                //    },
                //    5000
                //);
                callback();
            }
        ], 
        function (err) {
            if (err) {
                return console.log("pm2.start error: %j", err);
            }
            
            console.log("pm2.start complete");
            process.exit(0);      
        }
    );
    
});