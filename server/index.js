var express = require("express");
var app     = express();
var comp    = require("compression");
var http    = require("http").createServer(app);
var io      = require("socket.io").listen(http);
var roomManager = require("./room.js");

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
    socket.emit("room-created", newPlayer.room);
  });

  socket.on("startJoin", function(roomId){
    if(!(roomId in roomManager.rooms)){ //room doesn't exist
      socket.emit("room-dne");
      return;
    }

    roomManager.joinRoom(roomId, newPlayer);
    sockets[newPlayer.id] = socket;
    socket.emit("room-joined", newPlayer.room);
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
