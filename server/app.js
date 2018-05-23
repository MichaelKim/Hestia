const roomApps = []; //0-9999 corresponding to room id
const appNames = ['Add1', 'Canvas', 'Chat', 'Connect4', 'Ping', 'Quiz', 'Enlighten', 'Controller'];

module.exports = sockets => {
  function send(socketId, eventName, args) {
    sockets[socketId].emit('data-app-server', eventName, args);
  }

  function createRoomApp(players) {
    return {
      players, //{ID: { name: NAME, role: ROLE }}

      ons: [],

      on: function(eventName, callback) {
        this.ons[eventName] = callback;
      },

      emit: (socketId, eventName, ...data) => {
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

  return {
    appsNum: () => {
      return appNames.length;
    },
    appNames: () => {
      return appNames;
    },
    selectApp: (roomId, appId, players) => {
      var app = createRoomApp(players);
      app.on('_onload', function(socket) {
        var names = [];
        for (var id in app.players) {
          console.log(id);
          names.push(app.players[id].name);
        }
        var data = app.connect(socket.id);
        app.emit(socket, '_connected', names, data);
      });

      var newApp = new (require('./apps/server/' + appNames[appId] + '/server.js'))(app); //create new instance of server.js, not singleton
      console.log(newApp);
      newApp.onload();
      roomApps[roomId] = newApp;
    },
    joinApp: (roomId, socketID, player) => {
      roomApps[roomId].players[socketID] = player;

      roomApps[roomId].joined(socketID, player.name, player.role);
    },

    dataRetrieved: (roomId, socketId, eventName, data) => {
      if (roomApps[roomId]) {
        roomApps[roomId].execute(eventName, socketId, data);
      }
    },

    leaveApp: (roomId, socketId) => {
      // player leaves app
      if (roomApps[roomId]) {
        var player = roomApps[roomId].players[socketId];
        delete roomApps[roomId].players[socketId];
        roomApps[roomId].left(socketId, player.name, player.role);
      } else {
        console.log('leaving app: ' + roomId + ', ' + socketId + ': not found');
      }
      // remove player from app.players
      // roomApps[roomId].players
      // call some method in app like app.joined / app.left
    },

    quitApp: roomId => {
      // host leaves app
      console.log('room ' + roomId + ' quitting app');

      if (roomApps[roomId]) {
        roomApps[roomId].quit();
        delete roomApps[roomId];
      }
    }
  };
};
