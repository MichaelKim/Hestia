var fs = require("fs");
var appList = [];
var files = fs.readdirSync("./apps/"); //i'm sorry
files.forEach(function (file){
  if(fs.existsSync("./apps/" + file + "/index.html") &&
     fs.existsSync("./apps/" + file + "/main.js") &&
     fs.existsSync("./apps/" + file + "/server.js"))
     appList.push({ name: file,
                    html: "./apps/" + file + "/index.html",
                    js: "./apps/" + file + "/main.js",
                    server: "./apps/" + file + "/server.js"});
});

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
      sockets: players,

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
        for(var i=0;i<this.sockets.length;i++){
          this.sockets[i].emit.apply(this.sockets[i], args);
        }
      },

      execute: function(name, socket, data){
        data.unshift(socket);
        (this.ons[name]).apply(this.ons[name], data);
      }
    };
    var newApp = new (require("../apps/game1/server.js"))(app); //create new instance of server.js, not singleton

    this.roomApps[roomId] = newApp;

    var htmlFile = appList[appId].html;
    var jsFile = appList[appId].js;

    fs.readFile(htmlFile, "utf8", function(err, htmlData){ //am i doing this async thing right
      if(err) throw err;
      fs.readFile(jsFile, "utf8", function(err2, jsData){
        if(err2) throw err2;
        console.log({ html: htmlData, js: jsData });
        callback({ html: htmlData, js: jsData });
      });
    });
  },

  dataRetrieved: function(roomId, socket, name, data){
    console.log("appManager.dataRetrieved: " + name + "; " + data + "; " + roomId);

    this.roomApps[roomId].execute(name, socket, data);
  }

};
