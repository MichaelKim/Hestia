var appsSocket = require('socket.io-client')('https://hestia-apps.herokuapp.com');

var appNames = [];
var appsConnected = false;
var appManager = new apps();

appsSocket.on('connect', function() {
    console.log("APPS: CONNECT");
    appsConnected = true;
});

appsSocket.on("appNames", function(names) {
    appNames = names;
    console.log("Update app names: " + appNames);
});

appsSocket.on("apps-emit", function(socketId, eventName, args) {
    console.log("apps-emit:", eventName, args);
    appManager.send(socketId, eventName, args);
});

appsSocket.on("apps-emit-all", function(eventName, args, players) {
    console.log("apps-emit-all:", eventName, args);
    for(var id in players) {
        appManager.send(id, eventName, args);
    }
});

appsSocket.on('disconnect', function() {
    console.log("APPS: DISCONNECT");
    appsConnected = false;
});

function apps() {
    this.appsNum = function(){
        return appNames.list;
    };

    this.appNames = function(){
        return appNames;
    };

    this.connected = function() {
        return appsConnected;
    }

    this.selectApp = function(roomId, appId, players){
        console.log("selectApp", roomId, appId, players);
        appsSocket.emit("selectApp", roomId, appId, players);
    };

    this.joinApp = function(roomId, socketId, player){
        console.log("joinApp", roomId, socketId, player);
        appsSocket.emit("joinApp", roomId, socketId, player);
    };

    this.dataRetrieved = function(roomId, socketId, eventName, data){
        console.log("dataRetrieved", roomId, socketId, eventName, data);
        appsSocket.emit("dataRetrieved", roomId, socketId, eventName, data);
    };

    this.leaveApp = function(roomId, socketId) { //player leaves app
        console.log("leaveApp", roomId, socketId);
        appsSocket.emit("leaveApp", roomId, socketId);
    };

    this.quitApp = function(roomId){ //host leaves app
        console.log("quitApp", roomId);
        appsSocket.emit("quitApp", roomId);
    };

    this.send = function() {};
};

module.exports = appManager;
