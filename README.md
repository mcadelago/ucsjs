ucsjs
=====

Cisco UCS Manager Client built for Node
---------------------------------------

This is a promise-based asynchonous library for interacting with Cisco's UCS platform via their XML API.

### Installation

```
npm install git://github.com/ex1machina/ucsjs.git
```

### Usage

```
var ucs = require('ucsjs');
var Client;

ucs.login({
  "domain": "ucs-sample-domain",
  "user": "admin",
  "password": "password123"
})
  .then(function (client) {
    Client = client;
    return Client.resolveClass('lsServer');
  })
  
  .then(function (servers) {
    return Client.resolveParent(servers[0].dn);
  })
  
  .then(function (parent) {
    console.log(parent);
  })
  
  .fail(function (err) {
    console.log(err);
  })
  
  .fin(function () {
    Client.logout();
  });
```
  
  
  
