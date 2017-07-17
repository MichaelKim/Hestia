var fs = require("fs");
var appList = [];
var files = fs.readdirSync("./apps/");
files.forEach(function (file){
    if(fs.existsSync("./apps/" + file + "/index.html") &&
       fs.existsSync("./apps/" + file + "/main.js") &&
       fs.existsSync("./apps/" + file + "/server.js")) {
        appList.push({ name: file,
            html: "./apps/" + file + "/index.html",
            js: "./apps/" + file + "/main.js",
            server: "./apps/" + file + "/server.js"});
    }
});
console.log(files);
var appHeader = fs.readFileSync("./apps/appHeader.js", "utf8");

console.log(appList);

module.exports = {

    roomApps: [], //0-9999 corresponding to room id

    apps: appList,

    appsNum: function(){
        return appList.length;
    },

    appNames: function(){
        return appList.map(function(a){ return a.name; });
    },

    selectApp: function(roomId, appId, players, callback){
        var app = {
            players: players, //[ID: { name: NAME, socket: SOCKET, role: ROLE }]

            ons: [],

            on: function(){
                var args = Array.prototype.slice.call(arguments);
                this.ons[args[0]] = args[1];
            },

            emit: function(){
                var args = Array.prototype.slice.call(arguments);
                var socket = args[0];
                args[0] = "data-app-server";
                socket.emit.apply(socket, args);
            },

            emitAll: function(){
                var args = Array.prototype.slice.call(arguments);
                args.unshift("data-app-server");
                for(var id in players) {
                    var socket = this.players[id].socket;
                    socket.emit.apply(socket, args);
                }
            },

            execute: function(name, socket, data){
                data.unshift(socket);
                (this.ons[name]).apply(this.ons[name], data);
            },

            joined: function(id, name, role) {
                console.log(id + ", " + name + " joined, role: " + role);
            },

            left: function(id, name, role) {
                console.log(id + ", " + name + " left, role: " + role);
            },

            onload: function() {},

            connect: function() {
                return [];
            }
        };
        app.on("_onload", function(socket) {
            var names = [];
            for(var id in app.players) {
                names.push(app.players[id].name);
            }
            var data = app.connect();
            app.emit(socket, "_connected", names, data);
        });

        var newApp = new (require("." + appList[appId].server))(app); //create new instance of server.js, not singleton
        newApp.onload();
        this.roomApps[roomId] = newApp;

        var htmlFile = appList[appId].html;
        var jsFile = appList[appId].js;

        fs.readFile(htmlFile, "utf8", function(err, htmlData){ //am i doing this async thing right
            if(err) throw err;
            fs.readFile(jsFile, "utf8", function(err2, jsData){
                if(err2) throw err2;
                console.log({ html: htmlData, js: jsData });
                callback({ html: htmlData, js: appHeader + jsData });
            });
        });
    },

    joinApp: function(roomId, appId, socketID, player, callback){
        this.roomApps[roomId].players[socketID] = player;

        var htmlFile = appList[appId].html;
        var jsFile = appList[appId].js;

        fs.readFile(htmlFile, "utf8", function(err, htmlData){ //am i doing this async thing right
            if(err) throw err;
            fs.readFile(jsFile, "utf8", function(err2, jsData){
                if(err2) throw err2;
                console.log({ html: htmlData, js: jsData });
                callback({ html: htmlData, js: appHeader + jsData });
            });
        });

        this.roomApps[roomId].joined(socketID, player.name, player.role);
    },

    dataRetrieved: function(roomId, socket, name, data){
        //console.log("appManager.dataRetrieved: " + name + "; " + data + "; " + roomId);

        this.roomApps[roomId].execute(name, socket, data);
    },

    leaveApp: function(roomId, socketId) { //player leaves app
        var player = this.roomApps[roomId].players[socketId];
        delete this.roomApps[roomId].players[socketId];
        this.roomApps[roomId].left(socketId, player.name, player.role);
        // remove player from app.players
        // this.roomApps[roomId].players
        // call some method in app like app.joined / app.left
    },

    quitApp: function(roomId){ //host leaves app
        console.log("room " + roomId + " quitting app");
        delete this.roomApps[roomId];
    }
};
