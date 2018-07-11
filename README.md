# hestia.io

## Features

Hestia.io is a web app framework that manages instances of multi-user real-time apps.

It consists of

- A Node.js server (this repository)
- [A Javascript client library](https://github.com/LenKagamine/hestia-client)

## Installation

    npm install --save hestia-apps

## Usage

Hestia manages sockets with Socket.IO, and has a similar interface for handling events. The main difference is that the socket which triggered the event is sent as the first argument to the handler function.

```js
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Initialize hestia
const h = require('hestia-apps')(http);

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

Full documentation coming soon!

## Testing

```
npm test
```

The test suite uses Jest, and runs tests located in `test` directory.

## License

[MIT](https://github.com/LenKagamine/hestia/blob/master/LICENSE)
