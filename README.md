# hestia-apps

## Features

Hestia Apps is a web app framework that manages instances of multi-user real-time apps.

It consists of

- A Node.js server (this repository)
- A Javascript client library

## Installation

    npm install --save hestia-apps

## Usage

Hestia manages sockets with Socket.IO, and has a similar interface for handling events. The main difference is that the socket which triggered the event is sent as the first argument to the handler function.

```js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Initialize hestia
const h = require('hestia-apps')(io);

// Provide client-side app
app.use(express.static(__dirname + '/app/client.js'));

h.on('join', function(socket, data) {
  var roomID = h.createRoom();
  h.addPlayer({});

  // Start server-side app
  h.joinApp(roomID, 'myApp', __dirname + '/app/server.js');
  socket.emit('joined');
});

http.listen(5000);
```

## Documentation

Check out the full documentation [here](https://github.com/LenKagamine/hestia-apps/wiki).

## License

[MIT](https://github.com/LenKagamine/hestia-apps/blob/master/LICENSE)
