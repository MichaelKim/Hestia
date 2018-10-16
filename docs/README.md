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
- [Class: App](#app)

### Hestia

Exposed by `require('hestia.io')`.

#### new Hestia(httpServer: _http.Server_): _Hestia_

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

#### hestia.io: _Server_

This is a reference to the Socket.IO server created by Hestia with the passed http server. Feel free to use this for more customization.

#### hestia.on(eventName: _string_, callback: _(socket: Socket, ...data: any) => void_)

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

#### hestia.addPlayer(player: _Player_)

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
  h.editPlayer(playerID, /* ... */);
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

#### hestia.getPlayer(pid: _PlayerID_): _Player_

- `pid`: ID of player to return
- **Returns:** the player object with the corresponding ID

```js
h.on('join', socket => {
  const player = h.getPlayer(socket.id);
});
```

#### hestia.getSocket(pid: _PlayerID_): _Socket_

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

#### hestia.editPlayer(pid: _PlayerID_, editFn: _Player => Player_)

- `pid`: ID of player to modify
- `editFn`: Function that accepts the current player object and returns the updated player object

This is used for when modifying properties of the player object. While not enforced, it is recommended to keep `editFn` pure:

``` js
h.editPlayer(playerID, player => ({
  ...player,
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

#### hestia.createRoom(room: _?Object_): RoomID

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

#### hestia.joinRoom(rid: _RoomID_, pid: _PlayerID_): _boolean_

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

#### hestia.getRoom(rid: _RoomID_): _Room_

- `rid`: ID of the room to return
- **Returns:** the room object with matching ID

#### hestia.getRooms(): _{ [RoomID]: Room }_

- **Returns:** all rooms in an object, mapped by their IDs

#### hestia.editRoom(rid: _RoomID_, editFn: _Room => Room_)

- `rid`: ID of room to modify
- `editFn`: Function that accepts the current room object and returns the updated room object

This is the room version of [`hestia.editPlayer`](#hestiaeditplayerpid-playerid-editfn-player--player).

#### hestia.getPlayers(rid: _RoomID_): _Array<PlayerID>_

- `rid`: ID of room
- **Returns:** the list of player IDs that are in the room

#### hestia.leaveRoom(pid: _PlayerID_)

- `pid`: ID of player to leave room

If the player doesn't exist or is not in a room, this is a noop.

If the room that the player is in has an app open, the player will leave the app.

If the player was the only player in the room, the room will be deleted upon leaving.

#### hestia.getAppName(rid: _RoomID_): string

- `rid`: ID of room
- **Returns:** the name of the app running in the room

If the room doesn't exist, or is not running an app, this will return an empty string.

#### hestia.joinApp(rid: _RoomID_, appName: _AppID_, appPath: _string_)

- `rid`: ID of room
- `appName`: name of the app to join
- `appPath`: path to the main server file of the app

Example:

``` js
h.joinApp(player.room, 'my-app', __dirname + '/apps/server/my-app/server.js');
```

The app name is used only to easily identify apps, and is not used by Hestia. See [`App`](#app) for more details.

#### hestia.leaveApp(rid: _RoomID_)

- `rid`: ID of room

### Player

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

### Room

A room is an object with the following fields:

- `id`: _RoomID (number)_
  - ID of the room (currently limited from 0 to 9999)
- `players`: _PlayerID[]_
  - List of IDs of players in the room
- `app`: _AppID (string)_
  - Name of the app that is running in the room (empty string if no app is running)

Additional fields can be added using [`hestia.createRoom`](#hestiacreateroomroom-object-roomid).

### App

Coming soon!
