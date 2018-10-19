# API Reference

## Table of Contents

- [Class: Hestia](#hestia)
  - [new Hestia(httpServer)](#new-hestiahttpserver-httpserver-hestia)
  - [hestia.io](#hestiaio-server)
  - [hestia.on(eventName, callback)](#hestiaoneventname-string-callback-socket-socket-data-any--void)
  - [hestia.addPlayer(player)](#hestiaaddplayerplayer-player)
  - [hestia.getPlayer(pid)](#hestiagetplayerpid-playerid-player)
  - [hestia.getSocket(pid)](#hestiagetsocketpid-playerid-socket)
  - [hestia.editPlayer(pid, editFn)](#hestiaeditplayerpid-playerid-editfn-player--player)
  - [hestia.createRoom(room)](#hestiacreateroomroom-object-roomid)
  - [hestia.joinRoom(rid, pid)](#hestiajoinroomrid-roomid-pid-playerid-boolean)
  - [hestia.getRoom(rid)](#hestiagetroomrid-roomid-room)
  - [hestia.getRooms()](#hestiagetrooms--roomid-room-)
  - [hestia.editRoom(rid, editFn)](#hestiaeditroomrid-roomid-editfn-room--room)
  - [hestia.getPlayers(rid)](#hestiagetplayersrid-roomid-array)
  - [hestia.leaveRoom(pid)](#hestialeaveroompid-playerid)
  - [hestia.getAppName(rid)](#hestiagetappnamerid-roomid-string)
  - [hestia.joinApp(rid, appName, appPath)](#hestiajoinapprid-roomid-appname-appid-apppath-string)
  - [hestia.leaveApp(rid)](#hestialeaveapprid-roomid)
- [Class: Player](#player)
- [Class: Room](#room)
- [Apps](#apps)
  - [Client-side](#client)
    - [app.on(eventName, callback)](#apponeventname-string-callback-data-any--void)
    - [app.emit(eventName, ...args)](#appemiteventname-string-args-any)
    - [app.names()](#app.names-string)
    - [Event: app.joined](#event-appjoined--name-string--void)
    - [Event: app.left](#event-appleft--name-string--void)
    - [Event: app.onload](#event-app.onload--data-any--void)
  - [Server-side](#server)
    - [app.players](#appplayers-playerid-player)
    - [app.on(eventName, callback)](#apponeventname-string-callback-id-playerid-data-any--void)
    - [app.emit(id, eventName, ...args)](#appemitid-playerid-eventname-string-data-any)
    - [app.emitAll(eventName, ...args)](#appemitalleventname-string-data-any)
    - [Event: app.joined](#event-appjoined--id-playerid-name-string-role-number--void)
    - [Event: app.left](#event-appleft--id-playerid-name-string-role-number--void)
    - [Event: app.onload](#event-apponload----void)
    - [Event: app.connect](#event-appconnect--id-playerid-any)
    - [Event: app.quit](#event-appquit----void)

## Hestia

Exposed by `require('hestia.io')`.

### new Hestia(httpServer: _http.Server_): _Hestia_

- `httpServer`: the server to bind to.
- **Returns:** the Hestia object

Works with and without `new`:

```js
const h = require('hestia.io')(http);

// OR

const Hestia = require('hestia.io');
const h = new Hestia(http);
```

The `httpServer` that is passed to Hestia is used for starting a Socket.IO connection. For more details, check out the [socket.io docs](https://github.com/socketio/socket.io/blob/master/docs/API.md#new-serverhttpserver-options).

Aside from Socket.IO, Hestia also uses the server to automatically serve a build of `hestia.io-client` (`/hestia.js` and `/appHeader.js`).

### hestia.io: _Server_

This is a reference to the Socket.IO server created by Hestia with the passed http server. Feel free to use this for more customization.

### hestia.on(eventName: _string_, callback: _(socket: Socket, ...data: any) => void_)

- `eventName`: name of the event to listen for
- `callback`: function to run on event

Register a function to run when the specified event is called:

```js
// No args
h.on('init', socket => {
  // ...
});

// Single arg
h.on('start', (socket, name) => {
  console.log('Hello ' + name);
  console.log('ID: ' + socket.id);
});

// Multiple args
h.on('list', (socket, foo, bar, ...baz) => {
  /// ...
});
```

### hestia.addPlayer(player: _Player_)

- `player`: Player to be added

Hestia keeps track of a global list of players and manages them into rooms. For Hestia to manage a player, it first must be added with `hestia.addPlayer`. This allows users to reference players in Hestia using only their ids.

```js
h.on('start', (socket, name) => {
  const playerID = socket.id;
  // Add player with socket.id
  h.addPlayer({
    id: playerID,
    name: name
  });

  // Now that the player is added, we can use the player in Hestia
  h.joinRoom(123, playerID);
  h.leaveRoom(playerID);
  h.editPlayer(playerID /* ... */);
});
```

Players can also contain additional fields by adding more fields to the argument:

```js
h.addPlayer({
  id: playerID,
  foo: 'foo',
  bar: 'bar'
});

/*
h.getPlayer(playerID) === {
  id: playerID,
  foo: 'foo',
  bar: 'bar'
};
*/
```

### hestia.getPlayer(pid: _PlayerID_): _Player_

- `pid`: ID of player to return
- **Returns:** the player object with the corresponding ID

```js
h.on('join', socket => {
  const player = h.getPlayer(socket.id);
});
```

### hestia.getSocket(pid: _PlayerID_): _Socket_

- `pid`: ID of the player whose socket object is returned
- **Returns:** the Socket.io socket object of the player

This is useful when needing to send messages to a player without having received a message from that player. For example, when emitting to all players in a room:

```js
h.on('emit', socket => {
  const player = h.getPlayer(socket.id);

  h.getPlayers(player.room).forEach(pid => {
    // Send event 'hello-world' to all other players in the same room
    if (pid !== player.id) {
      h.getSocket(pid).emit('hello-world');
    }
  });
});
```

### hestia.editPlayer(pid: _PlayerID_, editFn: _Player => Player_)

- `pid`: ID of player to modify
- `editFn`: Function that accepts the current player object and returns the updated player object

This is used for when modifying properties of the player object. While not enforced, it is recommended to keep `editFn` pure:

```js
h.editPlayer(playerID, player => ({
  ...player
  // change properties
}));
```

For example, changing a player's name:

```js
h.addPlayer({
  id: playerID,
  name: 'foo'
});

// ...

h.editPlayer(playerID, player => ({
  ...player,
  name: 'bar'
}));
```

### hestia.createRoom(room: _?Object_): RoomID

- `room`: Partial room object
- **Returns:** the ID of the new room

If `room.players` is defined and is an array, any valid player IDs in `room.players` will be added to the newly created room. Otherwise, the new room will be empty.

Any added players will have their rooms set to the new room.

```js
// Assume these players are already added:
h.addPlayers({ id: 'a' });
h.addPlayers({ id: 'b' });
h.addPlayers({ id: 'c' });

const r1 = h.createRoom({
  players: ['a', 'b', 'c']
});
// r1 contains players ['a', 'b', 'c']

const r2 = h.createRoom({
  players: ['a', 'c', 'foo']
});
// r2 contains players ['a', 'c']

const r3 = h.createRoom({
  players: 'dingus'
});
const r4 = h.createRoom({});
const r5 = h.createRoom();
// r3, r4, and r5 contain no players []
```

Similar to [`hestia.addPlayer`](#hestiaaddplayerplayer-player), rooms can also contain additional fields by adding more fields to the argument:

```js
const rid = h.createRoom({
  foo: 'foo',
  bar: 'bar'
});

/*
h.getRoom(rid) === {
  players: [],
  foo: 'foo',
  bar: 'bar'
};
*/
```

Currently, room IDs are limited to integers between 0 and 9999 (10000 rooms available). In a later update, this limit is planned to be set via options passed to Hestia.

### hestia.joinRoom(rid: _RoomID_, pid: _PlayerID_): _boolean_

- `rid`: ID of the room to join
- `pid`: ID of the player that joins the room
- **Returns:** a boolean indicating if the joining was a success

If the joined room has an app open, the joining player will automatically join the app too.

```js
const rid = h.createRoom();
h.addPlayer({ id: 'a' });

const success = h.joinRoom(rid, 'a');
if (success) {
  // h.getRoom(rid).players === ['a']
}
```

### hestia.getRoom(rid: _RoomID_): _Room_

- `rid`: ID of the room to return
- **Returns:** the room object with matching ID

### hestia.getRooms(): _{ [RoomID]: Room }_

- **Returns:** all rooms in an object, mapped by their IDs

### hestia.editRoom(rid: _RoomID_, editFn: _Room => Room_)

- `rid`: ID of room to modify
- `editFn`: Function that accepts the current room object and returns the updated room object

This is the room version of [`hestia.editPlayer`](#hestiaeditplayerpid-playerid-editfn-player--player).

### hestia.getPlayers(rid: _RoomID_): _Array<PlayerID>_

- `rid`: ID of room
- **Returns:** the list of player IDs that are in the room

### hestia.leaveRoom(pid: _PlayerID_)

- `pid`: ID of player to leave room

If the player doesn't exist or is not in a room, this is a noop.

If the room that the player is in has an app open, the player will leave the app.

If the player was the only player in the room, the room will be deleted upon leaving.

### hestia.getAppName(rid: _RoomID_): string

- `rid`: ID of room
- **Returns:** the name of the app running in the room

If the room doesn't exist, or is not running an app, this will return an empty string.

### hestia.joinApp(rid: _RoomID_, appName: _AppID_, appPath: _string_)

- `rid`: ID of room
- `appName`: name of the app to join
- `appPath`: path to the main server file of the app

Example:

```js
h.joinApp(player.room, 'my-app', __dirname + '/apps/server/my-app/server.js');
```

The app name is used only to easily identify apps, and is not used by Hestia. See [`App`](#app) for more details.

### hestia.leaveApp(rid: _RoomID_)

- `rid`: ID of room

## Player

A player is an object with the following fields:

- `id`: _PlayerID (string)_
  - This must be the socket ID corresponding to this player (required)
- `name`: _string_
  - Name of the player
- `room`: _number_
  - Number of the room that the player is in (-1 means the player is not in a room)
- `role`: _number_
  - Role of the player (can be used inside apps)

Additional fields can be added using [`hestia.addPlayer`](#hestiaaddplayerplayer-player).

## Room

A room is an object with the following fields:

- `id`: _RoomID (number)_
  - ID of the room (currently limited from 0 to 9999)
- `players`: _PlayerID[]_
  - List of IDs of players in the room
- `app`: _AppID (string)_
  - Name of the app that is running in the room (empty string if no app is running)

Additional fields can be added using [`hestia.createRoom`](#hestiacreateroomroom-object-roomid).

## Apps

Apps can only be managed through rooms ([hestia.joinApp](#hestiajoinapprid-roomid-appname-appid-apppath-string) and [hestia.leaveApp](#hestialeaveapprid-roomid)). Apart from joining and leaving apps, they aren't accessible from Hestia, and can only be managed from within the app.

### Client

For the client, the main `index.html` file for the app must be available under `[my-domain.com]/[my-app-name]`. Hestia renders the client-side by pointing an iframe to that URL, and communicates with the server-side via Socket.IO.

`index.html` must add the app header file as a script tag:

```html
<script type="text/javascript" src="../appHeader.js"></script>
```

`appHeader.js` is automatically served by Hestia as `/appHeader.js`. It is also available as a separate package ([hestia.io-client](https://www.npmjs.com/package/hestia.io-client)).

Hestia provides the `app` object for the client with the following fields:

#### app.on(eventName: _string_, callback: _(...data: any) => void_)

- `eventName`: name of the event to listen for
- `callback`: function to run on event

Register a function to run when the specified event is called from the server-side app:

```js
// No args
app.on('init', () => {
  // ...
});

// Args
app.on('data', (name, points) => {
  console.log('Hello ' + name);
  console.log('Points: ' + points);
});
```

#### app.emit(eventName: _string_, ...args: _any_)

- `eventName`: name of event to emit
- `args`: data to send with event

Sends an event to the server-side app with data:

```js
// No args
app.emit('hello');

// Args
app.emit('data', true, 2, '3');
```

#### app.names(): _string[]_

- **Returns:** an array of player names currently in the app

#### Event: app.joined = (name: _string_) => void

Event when a player joins the app.

```js
app.joined = name => {
  console.log('New player: ' + name);
};
```

#### Event: app.left = (name: _string_) => _void_

Event when a player leaves the app.

```js
app.left = name => {
  console.log('Bye ' + name);
};
```

#### Event: app.onload = (...data: _any_) => _void_

Event when the client-side app connects to the server-side app. The incoming data is sent by `app.connect`. By default, no arguments are sent.

```js
app.onload = (foo, bar) => {
  // ...
};
```

### Server

The server-side app must export a function that acceps the `app` object and return it:

```js
module.exports = function(app) {
  // ...
  return app;
};
```

The `app` object is used to communicate with the client-side app, and contains the following fields:

#### app.players: _{[PlayerID]: Player}_

A map of player IDs to players in the app.

#### app.on(eventName: _string_, callback: _(id: PlayerID, ...data: any) => void_)

- `eventName`: name of the event to listen for
- `callback`: function to run on event

Register a function to run when the specified event is called from the client-side app.

Similar to [`hestia.on`](#hestiaoneventname-string-callback-socket-socket-data-any--void), the first argument to the callback is the id of the player who emitted the event.

#### app.emit(id: _PlayerID_, eventName: _string_, ...data: _any_)

- `id`: ID of player to send event to
- `eventName`: name of event to send
- `data`: data to send with event

The server-side app doesn't handle player sockets directly. Instead, sockets are abstracted away with the player IDs (which are the players' socket IDs). Since these IDs are provided in the callback of [`app.on`](#asdf), emitting a response to an event is similar to Hestia:

```js
app.on('init', (id, name) => {
  app.emit(id, 'hello', 'Hello ' + name);
});
```

#### app.emitAll(eventName: _string_, ...data: \_any)

- `eventName`: name of event to send
- `data`: data to send with event

This is similar to [`app.emit`](), but instead emits the event to all players in the app, and thus doesn't require a player ID to emit.

#### Event: app.joined = (id: _PlayerID_, name: _string_, role: _number_) => _void_

- `id`: ID of player that joined
- `name`: name of player that joined
- `role`: role of player that joined

Event when a player joins the app.

```js
app.joined = (id, name, role) => {
  console.log('Hello ' + name);
};
```

#### Event: app.left = (id: _PlayerID_, name: _string_, role: _number_) => _void_

- `id`: ID of player that left
- `name`: name of player that left
- `role`: role of player that left

Event when a player leaves the app.

```js
app.left = (id, name, role) => {
  console.log('Bye ' + name);
};
```

#### Event: app.onload = () => _void_

Event when the server-side app first loads. Use this event to execute any initialization code.

```js
app.onload = () => {
  // Init code
};
```

#### Event: app.connect = (id: _PlayerID_): _any[]_

- **Returns:** data sent to the client-side

Event when the client-side app connects to the app.

The return value of `app.connect` is sent to the client via the `app.onload` event as its arguments:

```js
// Server-side
app.connect = id => {
  return [1, 2, 3];
};

// Client-side
app.onload = (a, b, c) => {
  // a = 1, b = 2, c = 3
};
```

`app.connect` must return an array as its elements are spread into arguments for `app.onload`.

#### Event: app.quit = () => _void_

Event when the app is going to close. Use this event to execute any closing or cleanup code to prevent memory leaks:

```js
app.quit = () => {
  // Close any promises / requests / timeouts that may still be running
};
```
