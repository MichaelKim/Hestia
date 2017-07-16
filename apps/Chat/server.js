function serverApp(app){

    this.players = app.players;
    this.ons = app.ons;
    this.on = app.on;
    this.emit = app.emit;
    this.emitAll = app.emitAll;
    this.execute = app.execute;
    this.onload = app.onload;
    this.connect = app.connect;

    var messages = [];

    app.on("start", function(socket) {
        app.emit(socket, "messages", messages);
    });

    app.on("send-msg", function(socket, msg){
        messages.push(msg);
        var p = app.players[socket.id];
        app.emitAll("new-msg", p.name + ", " + p.role + ": " + msg);
    });

    app.connect = function() {
        return messages;
    }

    return this;
};

module.exports = serverApp;
