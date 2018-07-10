/* @flow */

'use strict';

import type { Socket, Player, Room, PlayerID, RoomID, AppID } from './types';

const read = require('fs').readFileSync;
const socketio = require('socket.io');

function hestia(http: any) {
  const sockets: { [PlayerID]: Socket } = {};
  const players: { [PlayerID]: Player } = {};
  const roomManager = require('./room');
  const appManager = require('./app')(sockets);
  const ons: { [string]: Function } = {};

  this.io = socketio(http);
  http.on('request', (req, res) => {
    if (req.url === '/hestia.js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(read(require.resolve('hestia.io-client/dist/hestia.js')), 'utf-8');
    } else if (req.url === '/appHeader.js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(read(require.resolve('hestia.io-client/dist/appHeader.js')), 'utf-8');
    }
  });

  this.on = (eventName: string, callback: Function) => {
    ons[eventName] = callback;
  };

  this.addPlayer = (player: Player) => {
    players[player.id] = player;
  };

  this.getSocket = (pid: PlayerID) => {
    return sockets[pid];
  };

  this.getPlayer = (pid: PlayerID) => {
    return players[pid];
  };

  this.editPlayer = (pid: PlayerID, editFn: Player => Player) => {
    players[pid] = editFn(players[pid]);
  };

  this.createRoom = (room: Object) => {
    const roomID = roomManager.createRoom(room);

    roomManager.getPlayers(roomID).forEach(pid => {
      players[pid].room = roomID;
    });

    return roomID;
  };

  this.joinRoom = (rid: RoomID, pid: PlayerID) => {
    const success = roomManager.joinRoom(pid, rid);

    if (success) {
      players[pid].room = rid;

      const currentApp = roomManager.getAppName(rid);
      if (currentApp !== '') {
        appManager.joinApp(rid, currentApp, players[pid]);
        roomManager.getPlayers(rid).forEach(p => {
          if (pid !== p) {
            sockets[p].emit('player-joined', players[pid].name);
          }
        });
      }
    }

    return success;
  };

  this.getRoom = (rid: RoomID) => {
    return roomManager.getRoom(rid);
  };

  this.getRooms = () => {
    return roomManager.getRooms();
  };

  this.editRoom = (rid: RoomID, editFn: Room => Room) => {
    roomManager.editRoom(rid, editFn);
  };

  this.getPlayers = (rid: RoomID) => {
    return roomManager.getPlayers(rid);
  };

  this.leaveRoom = (pid: PlayerID) => {
    const player = players[pid];
    if (player) {
      const numPlayers = roomManager.getPlayers(player.room).length;

      roomManager.leaveRoom(player.room, pid);
      players[pid].room = -1;

      if (numPlayers > 1) {
        const currentApp = roomManager.getAppName(player.room);
        if (currentApp !== '') {
          appManager.leaveApp(player.room, pid);
          roomManager.getPlayers(player.room).forEach(p => {
            sockets[p].emit('player-left', player.name);
          });
        }
      }

      delete players[pid];
    }
  };

  this.getAppName = (rid: RoomID) => {
    return roomManager.getAppName(rid);
  };

  this.joinApp = (rid: RoomID, appName: AppID, appPath: string) => {
    roomManager.setAppName(rid, appName);

    const roomPlayers = roomManager.getPlayers(rid).map(pid => players[pid]);
    appManager.selectApp(rid, appName, appPath, roomPlayers);
  };

  this.leaveApp = (rid: RoomID) => {
    roomManager.setAppName(rid, '');
    appManager.quitApp(rid);
  };

  this.io.on('connection', (socket: Socket) => {
    sockets[socket.id] = socket;
    Object.keys(ons).forEach(eventName => {
      socket.on(eventName, (...args) => ons[eventName](socket, ...args));
    });

    socket.on('dataApp', (eventName: string, data: any) => {
      // Should this be in App Manager?
      const player = players[socket.id];
      appManager.dataRetrieved(player.room, socket.id, eventName, data);
    });

    socket.on('disconnect', () => {
      const pid = socket.id;
      const player = players[pid];

      if (player) {
        roomManager.leaveRoom(player.room, pid);
        appManager.leaveApp(player.room, pid);

        roomManager.getPlayers(player.room).forEach(p => {
          sockets[p].emit('player-left', player.name);
        });

        delete players[pid];
        delete sockets[pid];
      }
    });
  });
}

module.exports = (http: any) => new hestia(http);
