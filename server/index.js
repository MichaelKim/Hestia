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
    room: undefined,
    host: false
  };

  socket.on("startCreate", function(){
    roomManager.createRoom(newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit("room-created", newPlayer.room, appManager.appNames());
  });

  socket.on("startJoin", function(roomId){
    if(!(roomId in roomManager.rooms)){ //room doesn't exist
      socket.emit("error-msg", "Room does not exist");
      return;
    }

    roomManager.joinRoom(roomId, newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit("room-joined", newPlayer.room, appManager.appNames());
  });

  socket.on("selectApp", function(appId){
    if(appId >= 0 && appId < appManager.apps.length){
      roomManager.currApp[newPlayer.room] = appId;
      console.log("room " + newPlayer.room + " selected app " + appId);

      
    }
    else{
      socket.emit("error-msg", "Invalid app ID");
    }
  });

  socket.on('disconnect', function(){
    roomManager.leaveRoom(newPlayer);
    console.log("Player dc: " + newPlayer.id);
  });

});




app.use(comp());
app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT  || 5000;
http.listen(port, function(){
  console.log("listening on:" + port);
});
