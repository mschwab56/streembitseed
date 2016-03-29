Build streemio-seed
-------------------

The streemio-seed software is a Node.js application. 


Run Streemio from source 
------------------------

```bash
$ git clone https://github.com/streemio-org/streemio-seed
$ cd /streemio-seed
```

Install the Node.js dependencies:  

```bash
$ npm install
```


Set the config/default.json configuration file.

The account name must be unique on the network. Please change the default "your_account_name" value otherwise the software won't be able to connect to the network. If the account name is not defined the application will use the address:port hash (SHA1) for account name.

address: enter the IP address of the server in which the streemio-seed application is executed. 

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

You must pass the working directory of streemio-seed to the pm2 application via the command line arguments. The command line argument is "-homedir", the directory name must follow this argument identifier.

```bash
$ node pm2start.js -- -homedir /to/path/sreemio-seed
```
(For more information about pm2 please refer to the pm2 library)
