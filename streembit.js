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

var config = require('./config');

var privatekey_password;

try {
    if (process.argv.indexOf("-pksecret") != -1) {
        privatekey_password = process.argv[process.argv.indexOf("-pksecret") + 1]; //grab the next item
    }
}
catch (err) {
    console.log("argument parse error: %j", err);
}

if (!privatekey_password) {
    privatekey_password = config.password;
    if (!privatekey_password) {
        //  try to get the current directory
        console.log("The private key password -pksecret command line parameter or config.password field is required!");
        process.exit(1);
    }
}

// use the nodejs crypto library
global.cryptolib = "crypto";

var logger = require("streembitlib/logger/logger");
global.applogger = logger;

if (!global.appevents) {
    var AppEvents = require("streembitlib/events/AppEvents");
    global.appevents = new AppEvents();
}

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var levelup = require('levelup');
var async = require('async');
var util = require('util');
var assert = require('assert');
var wotkad = require('streembitlib/kadlib');
var websocketsrv = require('./wssrvc').WebSocketSrv;
streembit.account = require("./account");
streembit.peernet = require("./peernet");
streembit.bootclient = require("./bootclient");

assert(config.node, "Invalid start arguments. Corect start format -config 'config settings' where 'config settings' is a field in the config.json file");
assert(config.node.port, "port must exists in the config field of config.json file");
assert(config.node.seeds, "seeds must exists in the config field of config.json file");
assert(Array.isArray(config.node.seeds), 'Invalid seeds supplied. "seeds" must be an array');

if (!config.node.address && (!config.node.seeds || !config.node.seeds.length)) {
    throw new Exception("If the address is not defined then the seed is required")
}

// ensure the ports of the seeds are correct
config.node.seeds.forEach(function (item, index, array) {
    if (!item.address) {
        throw new Exception("Application error: address for a seed is required")
    }
    if (!item.port) {
        item.port = DEFAULT_STREEMBIT_PORT;
    }
});

// initialize the database path
var maindb_path = path.join(__dirname, 'db', 'streemodb');

async.waterfall([
    function (callback) {
        var wdir = process.cwd();
        var logspath = path.join(wdir, 'logs');
        var loglevel = config.log && config.log.level ? config.log.level : "debug";
        logger.init(loglevel, logspath, null, callback);
    },      
    function (callback) {
        // create the db directory
        logger.info("initializing database, maindb_path: %s", maindb_path);
        fs.open(maindb_path, 'r', function (err, fd) {
            if (err && err.code == 'ENOENT') {
                /* the DB directory doesn't exist */
                logger.info("Creating database directory ...");
                var dbdir_path = path.join(__dirname, 'db');
                try {
                    fs.mkdirSync(dbdir_path);
                }
                catch (e) {
                    logger.error("creating database error: %j", e);
                }
                try {
                    fs.mkdirSync(maindb_path);
                }
                catch (e) {
                    logger.error("creating database error: %j", e);
                }
                fs.open(maindb_path, 'r', function (err, fd) {
                    if (err) {
                        callback(err)
                    }
                    else {
                        logger.info("DB directory created");
                        callback();
                    }
                });
            }
            else {
                callback();
            }
        });
    },    
    function (callback) {
        streembit.account.create(privatekey_password, callback);
    },
    function (callback) {
        logger.info("public key: %s", streembit.account.public_key);
        streembit.bootclient.discovery(config.node.address, config.node.seeds, callback);
    },
    function (address, callback) {
        if (!address) {
            callback("failed to populate discovery address");
        }
        else {
            config.node.address = address;
            streembit.bootclient.resolveseeds(config.node.seeds, callback);
        }
    },
    function (seeds, callback) {
        config.node.seeds = seeds;   
        var maindb = levelup(maindb_path);
        streembit.peernet.start(maindb, callback);
    },
    function (callback) {
        if (config.wsserver) {
            try {
                logger.debug("create web socket server");
                var wssrv = new websocketsrv();
                wssrv.init();   
                callback();
            }
            catch (err) {
                callback("wssrv.init error: " + err.message)
            }         
        }
        else {
            logger.debug("NO WS server");
            callback();
        }
    }
    ], 
    function (err, result) {
        if (err) {
            console.log("Main init error: %j", err);
            logger.error("Main init error: %j", err);
        }
    }
);

