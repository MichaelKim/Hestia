/* @flow strict */

import type {
  EventData,
  Socket,
  Player,
  PlayerID,
  App,
  AppPlayers,
  AppID,
  RoomID
} from './types';

module.exports = (sockets: { [PlayerID]: Socket }) => {
  const roomApps: { [RoomID]: App } = {}; //0-9999 corresponding to room id

  function joinApp(roomID: RoomID, appName: string, player: Player) {
    roomApps[roomID].players[player.id] = player;
    roomApps[roomID].joined(player.id, player.name, player.role);

    sockets[player.id].emit('app-joined', appName);
  }

  function selectApp(
    roomID: RoomID,
    appName: string,
    appPath: string,
    players: Player[]
  ) {
    const playerObj: AppPlayers = players.reduce(
      (acc, val) => Object.assign(acc, { [val.id]: val }),
      {}
    );
    const app = createRoomApp(playerObj);
    app.on('_onload', (socketID: PlayerID) => {
      const names = players.map(p => p.name || '');
      const data = app.connect(socketID);
      app.emit(socketID, '_connected', names, data);
    });

    // Create new instance of server.js, not singleton
    const newApp: App = new (require(appPath))(app);
    newApp.onload();
    roomApps[roomID] = newApp;

    players.forEach(p => {
      sockets[p.id].emit('app-joined', appName);
    });
  }

  function leaveApp(roomID: RoomID, playerID: PlayerID) {
    if (roomApps[roomID]) {
      const player = roomApps[roomID].players[playerID];
      delete roomApps[roomID].players[playerID];
      roomApps[roomID].left(playerID, player.name, player.role);

      sockets[playerID].emit('app-left');
    }
  }

  function quitApp(roomID: RoomID) {
    if (roomApps[roomID]) {
      roomApps[roomID].quit();

      Object.keys(roomApps[roomID].players).forEach(pid => {
        sockets[pid].emit('app-left');
      });

      delete roomApps[roomID];
    }
  }

  function dataRetrieved(
    roomID: RoomID,
    playerID: PlayerID,
    eventName: string,
    data: EventData
  ) {
    roomApps[roomID].execute(eventName, playerID, data);
  }

  function send(socketId: PlayerID, eventName: string, data: EventData) {
    sockets[socketId].emit('data-app-server', eventName, data);
  }

  function createRoomApp(players: AppPlayers): App {
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
        Object.keys(players).forEach(id => send(id, eventName, data));
      },

      execute: function(eventName, socketId, data) {
        this.ons[eventName].apply(this.ons[eventName], [socketId, ...data]);
      },

      joined: function(id, name, role) {
        // Overloaded by app
      },

      left: function(id, name, role) {
        // Overloaded by app
      },

      onload: function() {
        // Overloaded by app
      },

      connect: function(id) {
        // Overloaded by app
        return [];
      },

      quit: function() {
        // Overloaded by app
      }
    };
  }

  return {
    joinApp,
    selectApp,
    leaveApp,
    quitApp,
    dataRetrieved
  };
};
