var express = require("express");
var app     = express();
var comp    = require("compression");
var http    = require("http").createServer(app);
var io      = require("socket.io").listen(http);
var roomManager = require("./room.js");
var appManager = require("./app.js");

var sockets = {};

io.on("connection", function(socket){
  var newPlayer = {
    id: socket.id,
    room: -1,
    host: false
  };

  socket.on("startCreate", function(){
    if(newPlayer.room !== -1){ //switching rooms
      var newHostId = roomManager.leaveRoom(newPlayer);
      if(newHostId) sockets[newHostId].emit("host-changed", newHostId);
    }

    roomManager.createRoom(newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit("room-created", newPlayer.room, appManager.appNames());
  });

  socket.on("startJoin", function(roomId){
    if(!(roomId in roomManager.rooms)){ //room doesn't exist
      socket.emit("error-msg", "Room does not exist");
      return;
    }

    if(newPlayer.room !== -1){ //switching rooms
      var newHostId = roomManager.leaveRoom(newPlayer);
      if(newHostId) sockets[newHostId].emit("host-changed", newHostId);
    }

    roomManager.joinRoom(roomId, newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit("room-joined", newPlayer.room, appManager.appNames());
    var appId = roomManager.rooms[newPlayer.room].app;
    if(appId !== -1){
      socket.emit("app-changed", appId);
      appManager.joinApp(newPlayer.room, appId, socket, function(appData){
        socket.emit("app-selected", appData);
      });
    }
  });

  socket.on("selectApp", function(appId){
    if(!newPlayer.host){
      socket.emit("error-msg", "Only host can change app");
    }
    else if(!(appId >= 0 && appId < appManager.appsNum())){
      socket.emit("error-msg", "Invalid app ID");
    }
    else{
      console.log("room " + newPlayer.room + " selected app " + appId);
      roomManager.rooms[newPlayer.room].app = appId;

      //send to everyone in room about app selection
      var roomPlayers = roomManager.rooms[newPlayer.room].players;
      for(var i=0;i<roomPlayers.length;i++){
        sockets[roomPlayers[i].id].emit("app-changed", appId);
      }

      //sockets of everyone in the room
      var roomSockets = roomPlayers.map(function(p){ return sockets[p.id]; });

      appManager.selectApp(newPlayer.room, appId, roomSockets, function(appData){
        //send to all players in the room
        for(var i=0;i<roomSockets.length;i++){
          roomSockets[i].emit("app-selected", appData);
        }
      });
    }
  });

  socket.on("dataApp", function(){ //retrieve data sent by app
    var args = Array.prototype.slice.call(arguments);
    appManager.dataRetrieved(newPlayer.room, socket, args[0], args.slice(1));
  });

  socket.on("leaveApp", function(){ //leave app, erase everything about app
    if(newPlayer.host){ //only host can change app of a room
      roomManager.rooms[newPlayer.room].app = -1;

      appManager.quitApp(newPlayer.room);

      var roomPlayers = roomManager.rooms[newPlayer.room].players;
      for(var i=0;i<roomPlayers.length;i++){
        if(roomPlayers[i].id !== newPlayer.id){ //all but the host (who manually left)
          sockets[roomPlayers[i].id].emit("leave-app");
        }
      }
    }
    else socket.emit("leave-room"); //not the host, so leave room
  });

  socket.on('disconnect', function(){
    var newHostId = roomManager.leaveRoom(newPlayer);
    if(newHostId) sockets[newHostId].emit("host-changed", newHostId);
    console.log("Player dc: " + newPlayer.id);
  });

});




app.use(comp());
app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT  || 5000;
http.listen(port, function(){
  console.log("listening on:" + port);
});
