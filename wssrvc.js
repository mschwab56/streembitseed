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
var net = require('net');
var logger = require('streemiolib/logger/logger');
var http = require('http');
var appevents = require('streemiolib/events/AppEvents');
var wotmsg = require('streemiolib/message/wotmsg');


function ClientList() {
    
    var clients = {};

    var obj = {

        get: function (account) {
            return clients[account];
        },

        set: function (account, data) {
            clients[account] = data;
        },

        remove: function (socketid) {
            for (account in clients) {
                var data = clients[account];
                if (socketid == data.socketid) {
                    delete clients[account];
                }
            }            
        }

    };

    return obj;       
}

var WebSocketSrv = exports.WebSocketSrv = function () {
    try {
        this.server = 0;
        this.listOfClients = new ClientList();
    }
    catch (e) {
        logger.error(e);
    }
};

WebSocketSrv.prototype.find_contact = function (contact, callback) {
    try {
        if (!global.streemo_node) {
            throw new Error("peermsg error: streemo node is not connected");
        }
        
        global.streemo_node.find(contact, function (err, data) {
            if (err) {
                return callback(err);
            }
            
            try {
                var payload = wotmsg.getpayload(data);
                var contact_details = payload.data;
                callback(null, contact_details);
            }
            catch (e) {
                callback(e);
            }
        });

    }
    catch (err) {
        logger.error("find_contact error %j", err);
    }
}

WebSocketSrv.prototype.start = function (io) {
    var self = this;
    
    io.on('connection', function (socket) {
        
        var client = socket;
        
        socket.on("register_account", function (request, callback) {
            try {
                var account = request.account;
                var publickey = request.publickey;
                self.listOfClients.set(account, { publickey: publickey, socketid: socket.id, socket: socket });
                callback();
                logger.debug("ws register_account from: " + account);
            }
            catch (err) {
                logger.error(err);
            }
        });
        
        socket.on("put", function (request, callback) {
            try {
                if (!request.key || !request.value) {
                    return callback("invalid request parameter");
                }
                
                if (!global.streemo_node) {
                    return callback("error: 0x0110, the node is not initialized");
                }
                
                // true == store locally as well
                global.streemo_node.put(request.key, request.value, true, function (err) {
                    if (err) {
                        logger.error("node.put error: %j", err);
                        return callback(err);
                    }

                    callback(null);
                    
                    // broadcast the message
                    logger.debug("boradcast to ws peers");
                    socket.broadcast.emit("put", request);
                    
                    logger.debug("ws put for key: " + request.key);

                    // trye delete the message from the local storage if the message is a DELMSG type
                    if (request.key.indexOf("delmsg") > -1) {
                        global.streemo_node.delete_account_message(request, function (err) {
                            logger.error("Deleting message failed. error: %j", err);
                        });
                    }

                    //
                });
            }
            catch (err) {
                logger.error(err);
            }
        });
        
        socket.on("peermsg", function (request, callback) {
            try {
                if (!request || !request.message || !request.contact || !request.contact.name) {
                    return callback("Invalid peermsg request parameters");
                }

                var contact = request.contact;
                if (contact.protocol == "tcp") {
                    self.send_tcp_request(request, function (err) {
                        callback(err);
                    });
                }
                else {         
                    //logger.debug("ws peermsg from socket.id: " + socket.id);
                    var contactobj = self.listOfClients.get(contact.name);
                    if (contactobj && contactobj.socket) {
                        contactobj.socket.emit("peermsg", request);
                        callback();
                    }
                    else {
                        //  Route the message to the contact TCP 
                        callback("Error: 0x0110. Contact " + contact.name + " is not connected to web socket, message is not routed");                   
                    }
                }      
            }
            catch (err) {
                logger.error(err);
            }
        });
        
        socket.on("find", function (key, callback) {
            try {
                if (!key) {
                    return callback("invalid key parameter");
                }
                
                if (!global.streemo_node) {
                    return callback("error: 0x0110, the node is not initialized");
                }
                
                global.streemo_node.find(key, function (err, msg) {
                    callback(err, msg);
                });
            }
            catch (err) {
                logger.error(err);
            }
        });
        
        socket.on("get_account_messages", function (account, msgkey, callback) {
            try {
                if (!account) {
                    return callback("invalid key parameter");
                }
                if (!msgkey) {
                    return callback("invalid msgkey parameter");
                }
                
                if (!global.streemo_node) {
                    return callback("error: 0x0110, the node is not initialized");
                }
                
                global.streemo_node.get_stored_messages(account, msgkey, function (err, count, msgs) {
                    var reply = "";
                    if (err) {
                        reply = { error: err };
                    }
                    else {
                        reply = { error: 0, count: count, messages: msgs };
                    }
                    callback(null, reply);
                });

            }
            catch (err) {
                logger.error(err);
            }
        });
        
        socket.on("disconnect", function () {
            try {
                self.listOfClients.remove(socket.id);
            }
            catch (err) {
                logger.error("ws socket disconnect: %j", err);
            }
        });
    });
    
    logger.info("websocketsrv app srv initialized");
}

WebSocketSrv.prototype.init = function () {
    try {
        var srv = http.createServer(function (request, response) {
            // TODO handle this connection 
            logger.debug((new Date()) + ' received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        srv.listen(32318, function () {
            logger.info((new Date()) + ' Server is listening on port 32318');
        });
        
        this.server = srv;
        
        var io = require('socket.io')(this.server);
        this.start(io);

    }
    catch (err) {
        logger.error(err);
    }
};


WebSocketSrv.prototype.send_tcp_request = function (request, callback) {
    try {
        var contact = request.contact;
        var port = contact.port, address = contact.address;

        var sock = net.createConnection(port, address);
        
        sock.on('error', function (err) {
            logger.error('send_tcp_request send error: %j', err);
        });
        
        var message = request.message;
        sock.end(message);
        callback();
    }
    catch (err) {
        callback(err);
        logger.error('send_tcp_request error: %j', err);
    }
};




