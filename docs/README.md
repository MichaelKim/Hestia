# API Reference

## Table of Contents

- [Class: Hestia](#hestia)
  - new Hestia(httpServer)
  - hestia.io
  - hestia.on(eventName, callback)

### Hestia

Exposed by `require('hestia.io')`.

#### new Hestia(httpServer: _http.Server_): _hestia_

- `httpServer`: the server to bind to.
- **Returns:** the Hestia object

Works with and without `new`:

```js
const h = require('hestia.io')(http);

// OR

const Hestia = require('hestia.io');
const h = new Hestia(http);
```

The `httpServer` that is passed to Hestia is used for starting a Socket.IO connection. For more details, check out the [`socket.io docs`](https://github.com/socketio/socket.io/blob/master/docs/API.md#new-serverhttpserver-options).

Aside from Socket.IO, Hestia also uses the server to automatically serve a build of `hestia.io-client` (`/hestia.js` and `/appHeader.js`).

#### hestia.io: _(Socket.IO Server)_

This is a reference to the Socket.IO server created by Hestia with the passed http server. Feel free to use this for more customization.

#### hestia.on(eventName: _string_, callback: _(socket: Socket, ...data: any): void_)

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

Hestia keeps track of a global list of players and manages them into rooms. For Hestia to maange a player, it first must be added with `hestia.addPlayer`. This allows users to reference players in Hestia using only their ids.

#### hestia.getSocket(pid: _PlayerID_): _Socket_

- `pid`: ID of the player whose socket object is returned
- **Returns:** the Socket.io socket object of the player

This is useful when needing to send messages to a player without having a received message from that player.

#### hestia.getPlayer(pid: _PlayerID_): _Player_

- `pid`: ID of player to return
- **Returns:** the player object with the corresponding ID

#### hestia.editPlayer(pid: _PlayerID_, editFn: _Player => Player_)

- `pid`: ID of player to modify
- `editFn`: Function that accepts the current player object and returns the updated player object

This is used for when modifying properties of the player object. While not enforced, it is recommended to keep `editFn` pure:

``` js
h.editPlayer(id, player => ({
  ...player,
  // change properties
}));
```

#### hestia.createRoom(room: _$Shape&lt;Room&gt;_): RoomID

- `room`: Partial room object
- **Returns:** the ID of the new room

If `room.players` is defined and is an array, any valid player IDs in `room.players` will be added to the newly created room. Otherwise, the new room will be empty.

Any added players will have their rooms set to the new room.

#### hestia.joinRoom(rid: _RoomID_, pid: _PlayerID_): _boolean_

- `rid`: ID of the room to join
- `pid`: ID of the player that joins the room
- **Returns:** a boolean indicating if the joining was a success

If the joined room has an app open, the joining player will automatically join the app too.

#### hestia.getRoom(rid: _RoomID_): _Room_

- `rid`: ID of the room to return
- **Returns:** the room object with matching ID

#### hestia.getRooms(): _{ [RoomID]: Room }_

- **Returns:** all rooms in an object, mapped by their IDs

#### hestia.editRoom(rid: _RoomID_, editFn: _Room => Room_)

- `rid`: ID of room to modify
- `editFn`: Function that accepts the current room object and returns the updated room object

This is the room version of `hestia.editPlayer`.

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

The app name is used only to easily identify apps, and is not used by Hestia. See `Apps` for more details.

#### hestia.leaveApp(rid: _RoomID_)

- `rid`: ID of room

### Player

A player is an object with the following fields:

- id: _string_ This must be the socket ID corresponding to this player (required)
- name: _string_ Name of the player
- room: _number_ Number of the room that the player is in (-1 means the player is not in a room)
- role: _number_ Role of the player (can be used inside apps)

### Room

Coming soon!

### App

Coming soon!
