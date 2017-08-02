var express = require("express");
var app     = express();
var comp    = require("compression");
var http    = require("http").createServer(app);
var io      = require("socket.io").listen(http);
var roomManager = require("./room.js");
var appManager = require("./app.js");

var sockets = {};

appManager.send = function(socketId, eventName, args) {
    console.log(socketId, eventName, args);
    sockets[socketId].emit("data-app-server", eventName, args);
};

io.on("connection", function(socket) {
    var newPlayer = {
        id: socket.id,
        name: "",
        room: -1,
        role: -1 //-1: not set, 0: host, 1: player, 2: spectator
    };

    socket.on("startCreate", function(name) {
        if(newPlayer.room !== -1){ //switching rooms
            var newHostId = roomManager.leaveRoom(newPlayer);
            if(newHostId) {
                sockets[newHostId].emit("role-changed", 0);
            }
        }

        newPlayer.name = name;
        newPlayer.role = 0;

        roomManager.createRoom(newPlayer);
        sockets[newPlayer.id] = socket;
        socket.emit("room-created", newPlayer.room, appManager.appNames());
    });

    socket.on("startJoin", function(name, roomId) {
        if(!roomManager.roomExists(roomId)) { //room doesn't exist
            socket.emit("error-msg", "Room does not exist");
            return;
        }

        newPlayer.name = name;
        newPlayer.role = 1;

        if(newPlayer.room !== -1){ //switching rooms
            var newHostId = roomManager.leaveRoom(newPlayer);
            if(newHostId) {
                sockets[newHostId].emit("role-changed", 0);
            }
        }

        roomManager.joinRoom(roomId, newPlayer);
        sockets[newPlayer.id] = socket;

        var appId = roomManager.getAppId(newPlayer.room);
        socket.emit("room-joined", newPlayer.room, appManager.appNames());
        if(appId !== -1) { //App selected
            socket.emit("app-changed", appId, appManager.appNames()[appId]);

            var updatePlayer = {
                name: newPlayer.name,
                role: newPlayer.role
            };
            appManager.joinApp(newPlayer.room, newPlayer.id, updatePlayer);

            var roomPlayers = roomManager.rooms[newPlayer.room].players;
            for(var i = 0; i < roomPlayers.length; ++i){
                if(roomPlayers[i].id !== newPlayer.id) {
                    sockets[roomPlayers[i].id].emit("player-joined", newPlayer.name);
                }
            }
        }
    });

    socket.on("selectApp", function(appId) {
        if(newPlayer.role !== 0) {
            socket.emit("error-msg", "Only host can change app");
        }
        else if(appId < 0 || appId >= appManager.appsNum()) {
            socket.emit("error-msg", "Invalid app ID");
        }
        else {
            console.log("room " + newPlayer.room + " selected app " + appId);
            roomManager.setAppId(newPlayer.room, appId);

            //send to everyone in room about app selection
            var updatePlayers = {};
            var roomPlayers = roomManager.rooms[newPlayer.room].players;
            for(var i = 0; i < roomPlayers.length; ++i){
                var p = roomPlayers[i];
                sockets[p.id].emit("app-changed", appId, appManager.appNames()[appId]);
                updatePlayers[p.id] = {
                    name: p.name,
                    role: p.role
                };
            }

            appManager.selectApp(newPlayer.room, appId, updatePlayers);
        }
    });

    socket.on("dataApp", function(eventName, args) { //retrieve data sent by app
        appManager.dataRetrieved(newPlayer.room, socket.id, eventName, args);
    });

    socket.on("leave", function() {
        if(newPlayer.role === 0 && roomManager.getAppId(newPlayer.room) !== -1) {
            // leave app
            leaveApp(newPlayer);
        }
        else {
            socket.disconnect(0);
        }
    });

    socket.on('disconnect', function(){
        if(newPlayer.role === 0 && roomManager.getAppId(newPlayer.room) !== -1) {
            leaveApp(newPlayer);
        }
        else {
            leaveRoom(newPlayer);
        }
        console.log("Player dc: " + newPlayer.id);
    });
});

function leaveApp(newPlayer) {
    console.log("Player leave app: " + newPlayer.id);
    roomManager.setAppId(newPlayer.room, -1);

    appManager.quitApp(newPlayer.room);

    var roomPlayers = roomManager.rooms[newPlayer.room].players;
    for(var i = 0; i < roomPlayers.length; ++i){
        sockets[roomPlayers[i].id].emit("leave-app", appManager.appNames());
    }
}

function leaveRoom(newPlayer) {
    console.log("Player exit: " + newPlayer.id);
    sockets[newPlayer.id].emit("leave-room");

    if(roomManager.getAppId(newPlayer.room) !== -1) {
        // leave app
        appManager.leaveApp(newPlayer.room, newPlayer.id);

        var roomPlayers = roomManager.rooms[newPlayer.room].players;
        for(var i = 0; i < roomPlayers.length; ++i){
            if(roomPlayers[i].id !== newPlayer.id) {
                sockets[roomPlayers[i].id].emit("player-left", newPlayer.name);
            }
        }
    }

    var newHostId = roomManager.leaveRoom(newPlayer);
    if(newHostId) {
        sockets[newHostId].emit("role-changed", 0); //new host
    }
}

app.use(comp());
app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT  || 5000;
http.listen(port, function() {
    console.log("listening on:" + port);
});
