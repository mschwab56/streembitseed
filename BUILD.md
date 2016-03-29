Build streemio-seed
-------------------

The streemio-seed software is a Node.js application. 


Run Streemio from source 
------------------------

```bash
$ git clone https://github.com/streemio-org/streemiolib
$ cd /streemio-seed
```

Install the Node.js dependencies:  

```bash
$ npm install
```


Set the config/default.json configuration file.

The account name must be unique on the network. If the account name is not defined the application will use the address:port hash (SHA1) for account name.

Seeds: array of seed nodes. Default is seed.streemio.org, seed.streemio.net, seed.streemio.biz and seed.streemio.co.

discoverysrvc: implements the discovery service. The discovery service has an important role in the Streemio network to assist in propogating information about the nodes.

Log settings: define the level of log.

wsserver: whether start a WebSocket listener or not. WebSocket listener serves Streemio clients which unable to open a TCP port and use the WebSocket fallback.

Private network: please refer to the private network documention for more information about the Streemio private networks.

```json
{
    "node": {
        "account": "your_account_name",
        "address": "your_server_ip_address",
        "port": 32320,
        "seeds": [
		{
            "account": "seed.streemio.org",
            "address": "seed.streemio.org",
            "port": 32320
        },
		{
            "account": "seed.streemio.net",
            "address": "seed.streemio.net",
            "port": 32320
        },            
        {
            "account": "seed.streemio.biz",
            "address": "seed.streemio.biz",
            "port": 32320
        },
		{
            "account": "seed.streemio.co",
            "address": "seed.streemio.co",
            "port": 32320
        }]
    },
    "log": {
        "level": "debug"
    },
    "discoverysrvc": true,
    "wsserver": true,
    "private_network": false,
    "private_network_accounts": []
}
```

Run streemio-seed:  
```bash
$ node streemio.js
```


Alternatively, start streemio-seed as a background/service process using the pm2 library.
Edit the pm2start.js file to set the correct home directory. Change the pm2start.js at line 35 and line 37, you must define at these lines the work directory of streemio-seed.
```bash
$ node pm2start.js
```
(For more information about pm2 please refer to the pm2 library)
