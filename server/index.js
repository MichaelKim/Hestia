/* @flow */

const express = require('express');
const app = express();
const comp = require('compression');
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);

app.use(comp());
app.use(express.static(__dirname + '/../client'));
app.use(express.static(__dirname + '/apps/client'));

const port = parseInt(process.env.PORT) || 5000;
http.listen(port, () => {
  console.log('listening on:' + port);
});

import { toRoomID, toAppID } from './types';
import type { Socket, Player, PlayerID, RoomID, AppID } from './types';

const sockets: { [PlayerID]: Socket } = {};
const roomManager = require('./room.js');
const appManager = require('./app.js')(sockets);

io.on('connection', (socket: Socket) => {
  const newPlayer: Player = {
    id: socket.id,
    name: '',
    room: toRoomID(-1),
    role: -1 //-1: not set, 0: host, 1: player, 2: spectator
  };

  socket.on('startCreate', (name: string) => {
    if (newPlayer.room !== -1) {
      // Switching rooms
      const newHostId = roomManager.leaveRoom(newPlayer);
      if (newHostId) {
        sockets[newHostId].emit('role-changed', 0);
      }
    }

    newPlayer.name = name;
    newPlayer.role = 0;

    roomManager.createRoom(newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit('room-created', newPlayer.room, appManager.getAppNames());
  });

  socket.on('startJoin', (name: string, roomId: RoomID) => {
    if (!roomManager.roomExists(roomId)) {
      //room doesn't exist
      socket.emit('error-msg', 'Room does not exist');
      return;
    }

    newPlayer.name = name;
    newPlayer.role = 1;

    if (newPlayer.room !== -1) {
      //switching rooms
      const newHostId = roomManager.leaveRoom(newPlayer);
      if (newHostId) {
        sockets[newHostId].emit('role-changed', 0);
      }
    }

    roomManager.joinRoom(roomId, newPlayer);
    sockets[newPlayer.id] = socket;

    const appId = roomManager.getAppId(newPlayer.room);
    socket.emit('room-joined', newPlayer.room, appManager.getAppNames());
    if (appId !== -1) {
      //App selected
      socket.emit('app-changed', appId, appManager.getAppNames()[appId]);

      appManager.joinApp(newPlayer.room, newPlayer.id, newPlayer);

      const roomPlayers = roomManager.getPlayers(newPlayer.room);
      roomPlayers.forEach(player => {
        if (player.id !== newPlayer.id) {
          sockets[player.id].emit('player-joined', newPlayer.name);
        }
      });
    }
  });

  socket.on('selectApp', (appId: AppID) => {
    if (newPlayer.role !== 0) {
      socket.emit('error-msg', 'Only host can change app');
    } else if (appId < 0 || appId >= appManager.appsNum()) {
      socket.emit('error-msg', 'Invalid app ID');
    } else {
      console.log('room ' + newPlayer.room + ' selected app ' + appId);
      roomManager.setAppId(newPlayer.room, appId);

      //send to everyone in room about app selection
      const updatePlayers: {
        [PlayerID]: Player
      } = {};
      const roomPlayers = roomManager.getPlayers(newPlayer.room);
      const appName = appManager.getAppNames()[appId];
      roomPlayers.forEach(p => {
        sockets[p.id].emit('app-changed', appId, appName);
        updatePlayers[p.id] = p;
      });

      appManager.selectApp(newPlayer.room, appId, updatePlayers);
    }
  });

  socket.on('dataApp', (eventName: string, args: any) => {
    //retrieve data sent by app
    appManager.dataRetrieved(newPlayer.room, socket.id, eventName, args);
  });

  socket.on('leave', () => {
    if (newPlayer.role === 0 && roomManager.getAppId(newPlayer.room) !== -1) {
      // leave app
      leaveApp(newPlayer);
    } else {
      socket.disconnect(0);
    }
  });

  socket.on('disconnect', () => {
    if (sockets[newPlayer.id]) {
      if (newPlayer.role === 0 && roomManager.getAppId(newPlayer.room) !== -1) {
        leaveApp(newPlayer);
      } else {
        leaveRoom(newPlayer);
      }
      console.log('Player dc: ' + newPlayer.id);
    }
  });
});

function leaveApp(newPlayer) {
  console.log('Player leave app: ' + newPlayer.id);
  roomManager.setAppId(newPlayer.room, toAppID(-1));

  appManager.quitApp(newPlayer.room);

  const roomPlayers = roomManager.getPlayers(newPlayer.room);
  const appNames = appManager.getAppNames();
  roomPlayers.forEach(player => {
    sockets[player.id].emit('leave-app', appNames);
  });
}

function leaveRoom(newPlayer) {
  console.log('Player exit: ' + newPlayer.id);
  sockets[newPlayer.id].emit('leave-room');

  if (roomManager.getAppId(newPlayer.room) !== -1) {
    // leave app
    appManager.leaveApp(newPlayer.room, newPlayer.id);

    const roomPlayers = roomManager.getPlayers(newPlayer.room);
    roomPlayers.forEach(player => {
      if (player.id !== newPlayer.id) {
        sockets[player.id].emit('player-left', newPlayer.name);
      }
    });
  }

  const newHostId = roomManager.leaveRoom(newPlayer);
  if (newHostId) {
    sockets[newHostId].emit('role-changed', 0); //new host
  }
}
