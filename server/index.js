/* @flow */

const express = require('express');
const app = express();
const comp = require('compression');
const http = require('http').createServer(app);
const h = require('hestia-apps')(http, __dirname);

app.use(comp());
app.use(express.static(__dirname + '/../client'));
app.use(express.static(__dirname + '/apps/client'));

const port = parseInt(process.env.PORT) || 5000;
http.listen(port, () => {
  console.log('listening on:' + port);
});

/*
Hestia example: hestia apps website
- Entry: create, join
- Multiple apps
*/

const appNames = ['Add1', 'Canvas', 'Chat', 'Connect4', 'Ping', 'Quiz', 'Enlighten', 'Controller'];

h.on('startCreate', (socket: any, name: string) => {
  console.log('Creating new room');
  const roomID = h.createRoom({
    host: socket.id,
    players: [socket.id]
  });

  h.addPlayer({
    id: socket.id,
    name,
    room: roomID,
    role: 0
  });

  socket.emit('room-created', roomID, appNames);
});

h.on('startJoin', (socket: any, name: string, roomID: number) => {
  h.addPlayer({
    id: socket.id,
    name,
    room: roomID,
    role: 1
  });

  const success = h.joinRoom(roomID, socket.id);
  if (!success) {
    // TODO: if room doesn't exist, player is added to global players list, but not in room: memory leak
    socket.emit('error-msg', 'Room does not exist');
    return;
  }

  socket.emit('room-joined', roomID, appNames);

  const appName = h.getAppName(roomID);
  if (appName) {
    socket.emit('app-changed', appNames.indexOf(appName), appName);
  }
});

h.on('selectApp', (socket: any, appID: number) => {
  const player = h.getPlayer(socket.id);

  if (player.role !== 0) {
    socket.emit('error-msg', 'Only hosts can select apps');
    return;
  }
  if (appID < 0 || appID >= appNames.length) {
    socket.emit('error-msg', 'Invalid app ID');
    return;
  }

  const appName = appNames[appID];
  h.joinApp(player.room, appName, './apps/server/' + appName + '/server.js');

  h.getPlayers(player.room).forEach(pid => {
    h.getSocket(pid).emit('app-changed', appID, appName);
  });
});

h.on('leave', (socket: any) => {
  const player = h.getPlayer(socket.id);

  if (player.role === 0 && h.getAppName(player.room) !== '') {
    // Host leaves app = room leaves app
    console.log('Room ' + player.room + ': Leaving app');
    h.leaveApp(player.room);

    h.getPlayers(player.room).forEach(pid => {
      h.getSocket(pid).emit('leave-app', appNames);
    });
  } else {
    console.log('Player ' + player.id + ' quitting');
    const numPlayers = h.getPlayers(player.room).length;

    h.leaveRoom(player.id);
    socket.emit('leave-room');

    // Get new host
    if (numPlayers > 1 && player.role === 0) {
      // Set room's host
      let newHostID: string = '';
      h.editRoom(player.room, room => {
        newHostID = room.players[0];
        return {
          ...room,
          host: newHostID
        };
      });

      // Set player to host
      h.editPlayer(newHostID, newHost => {
        newHost.role = 0;
        return newHost;
      });
      h.getSocket(newHostID).emit('role-changed', 0);
    }

    socket.disconnect(0);
  }
});
