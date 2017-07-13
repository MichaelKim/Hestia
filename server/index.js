var express = require("express");
var app     = express();
var comp    = require("compression");
var http    = require("http").createServer(app);
var io      = require("socket.io").listen(http);
var roomManager = require("./room.js");
var appManager = require("./app.js");

var sockets = {};

io.on("connection", function(socket) {
    var newPlayer = {
        id: socket.id,
        name: "",
        room: -1,
        host: false
    };

    socket.on("startCreate", function(name) {
        if(newPlayer.room !== -1){ //switching rooms
            var newHostId = roomManager.leaveRoom(newPlayer);
            if(newHostId) {
                sockets[newHostId].emit("host-changed");
            }
        }

        newPlayer.name = name;

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

        if(newPlayer.room !== -1){ //switching rooms
            var newHostId = roomManager.leaveRoom(newPlayer);
            if(newHostId) {
                sockets[newHostId].emit("host-changed");
            }
        }

        roomManager.joinRoom(roomId, newPlayer);
        sockets[newPlayer.id] = socket;

        var appId = roomManager.getAppId(newPlayer.room);
        if(appId === -1) { //app not selected
            socket.emit("room-joined", newPlayer.room, appManager.appNames());
        }
        else {
            socket.emit("app-changed", appId);

            var updatePlayer = {
                socket: socket,
                name: newPlayer.name,
                host: newPlayer.host
            };
            appManager.joinApp(newPlayer.room, appId, updatePlayer, function(appData) {
                socket.emit("app-selected", appData);
            });
        }

        var roomPlayers = roomManager.rooms[newPlayer.room].players;
        for(var i = 0; i < roomPlayers.length; ++i){
            if(roomPlayers[i].id !== newPlayer.id) {
                sockets[roomPlayers[i].id].emit("player-joined", newPlayer.name);
            }
        }
    });

    socket.on("selectApp", function(appId) {
        if(!newPlayer.host) {
            socket.emit("error-msg", "Only host can change app");
        }
        else if(appId < 0 || appId >= appManager.appsNum()) {
            socket.emit("error-msg", "Invalid app ID");
        }
        else {
            console.log("room " + newPlayer.room + " selected app " + appId);
            roomManager.setAppId(newPlayer.room, appId);

            //send to everyone in room about app selection
            var updatePlayers = [];
            var roomPlayers = roomManager.rooms[newPlayer.room].players;
            for(var i = 0; i < roomPlayers.length; ++i){
                var p = roomPlayers[i];
                sockets[p.id].emit("app-changed", appId);
                updatePlayers.push({
                    socket: sockets[p.id],
                    name: p.name,
                    host: p.host
                });
            }

            appManager.selectApp(newPlayer.room, appId, updatePlayers, function(appData) {
                //send to all players in the room
                for(var i = 0; i < roomPlayers.length; ++i) {
                    sockets[roomPlayers[i].id].emit("app-selected", appData);
                }
            });
        }
    });

    socket.on("dataApp", function() { //retrieve data sent by app
        var args = Array.prototype.slice.call(arguments);
        appManager.dataRetrieved(newPlayer.room, socket, args[0], args.slice(1));
    });

    socket.on("leave", function() {
        if(newPlayer.host) {
            if(roomManager.rooms[newPlayer.room].app === -1) {
                // host leaves room
                // leave room
                console.log("Player exit: " + newPlayer.id);
                socket.emit("leave-room");
                socket.disconnect(0);
            }
            else {
                roomManager.rooms[newPlayer.room].app = -1;

                appManager.quitApp(newPlayer.room);

                var roomPlayers = roomManager.rooms[newPlayer.room].players;
                for(var i = 0; i < roomPlayers.length; ++i){
                    sockets[roomPlayers[i].id].emit("leave-app", appManager.appNames());
                }
            }
        }
        else {
            // leave room
            console.log("Player exit: " + newPlayer.id);
            socket.emit("leave-room");
            socket.disconnect(0);
        }
    });

    socket.on('end', function() {
        console.log("Player exit: " + newPlayer.id);
        socket.disconnect(0);
    });

    socket.on('disconnect', function(){
        if(newPlayer.room !== -1) {
            var roomPlayers = roomManager.rooms[newPlayer.room].players;
            for(var i = 0; i < roomPlayers.length; ++i){
                if(roomPlayers[i].id !== newPlayer.id) {
                    sockets[roomPlayers[i].id].emit("player-left", newPlayer.name);
                }
            }
        }

        var newHostId = roomManager.leaveRoom(newPlayer);
        if(newHostId) {
            sockets[newHostId].emit("host-changed"); //new host
        }

        console.log("Player dc: " + newPlayer.id);
    });
});

app.use(comp());
app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT  || 5000;
http.listen(port, function() {
    console.log("listening on:" + port);
});
