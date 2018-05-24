/* @flow */

import { toPlayerID } from './types';
import type { Socket, Player, PlayerID, App, RoomID } from './types';

const roomApps: { [RoomID]: App } = {}; //0-9999 corresponding to room id
const appNames = ['Add1', 'Canvas', 'Chat', 'Connect4', 'Ping', 'Quiz', 'Enlighten', 'Controller'];

type Players = {
  [id: PlayerID]: Player
};

function appsNum() {
  return appNames.length;
}

function getAppNames() {
  return appNames;
}

function joinApp(roomId: RoomID, socketID: PlayerID, player: Player) {
  roomApps[roomId].players[socketID] = player;

  roomApps[roomId].joined(socketID, player.name, player.role);
}

function dataRetrieved(roomId: RoomID, socketId: PlayerID, eventName: string, data: any) {
  if (roomApps[roomId]) {
    roomApps[roomId].execute(eventName, socketId, data);
  }
}

function leaveApp(roomId: RoomID, socketId: PlayerID) {
  // player leaves app
  if (roomApps[roomId]) {
    const player = roomApps[roomId].players[socketId];
    delete roomApps[roomId].players[socketId];
    roomApps[roomId].left(socketId, player.name, player.role);
  } else {
    console.log('leaving app: ' + roomId + ', ' + socketId + ': not found');
  }
  // remove player from app.players
  // roomApps[roomId].players
  // call some method in app like app.joined / app.left
}

function quitApp(roomId: RoomID) {
  // host leaves app
  console.log('room ' + roomId + ' quitting app');

  if (roomApps[roomId]) {
    roomApps[roomId].quit();
    delete roomApps[roomId];
  }
}

module.exports = (sockets: { [PlayerID]: Socket }) => {
  function send(socketId: PlayerID, eventName: string, args: any) {
    sockets[socketId].emit('data-app-server', eventName, args);
  }

  function createRoomApp(players: Players): App {
    return {
      players, //{ID: { name: NAME, role: ROLE }}

      ons: {},

      on: function(eventName, callback) {
        this.ons[eventName] = callback;
      },

      emit: (socketId: PlayerID, eventName, ...data) => {
        send(socketId, eventName, data);
      },

      emitAll: (eventName, ...data) => {
        Object.keys(players)
          .map(toPlayerID)
          .forEach(id => send(id, eventName, data));
      },

      execute: function(eventName, socketId, data) {
        this.ons[eventName].apply(this.ons[eventName], [socketId, ...data]);
      },

      joined: function(id, name, role) {
        // Overloaded by app
        console.log(id + ', ' + name + ' joined, role: ' + role);
      },

      left: function(id, name, role) {
        // Overloaded by app
        console.log(id + ', ' + name + ' left, role: ' + role);
      },

      onload: function() {
        // Overloaded by app
        console.log('onload');
      },

      connect: function(id) {
        // Overloaded by app
        return [];
      },

      quit: function() {
        // Overloaded by app
        console.log('quit');
      }
    };
  }

  function selectApp(roomId: RoomID, appId: number, players: Players) {
    const app = createRoomApp(players);
    app.on('_onload', (socketID: PlayerID) => {
      const names = Object.keys(app.players)
        .map(toPlayerID)
        .map(id => app.players[id].name);
      const data = app.connect(socketID);
      app.emit(socketID, '_connected', names, data);
    });

    // Create new instance of server.js, not singleton
    const newApp: App = new (require('./apps/server/' + appNames[appId] + '/server.js'))(app);
    newApp.onload();
    roomApps[roomId] = newApp;
  }

  return {
    appsNum,
    getAppNames,
    selectApp,
    joinApp,
    dataRetrieved,
    leaveApp,
    quitApp
  };
};
