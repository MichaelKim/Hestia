module.exports = function (app){

    this.players = app.players;
    this.ons = app.ons;
    this.on = app.on;
    this.emit = app.emit;
    this.emitAll = app.emitAll;
    this.execute = app.execute;

    var messages = [];

    app.on("onload", function(socket) {
        var names = app.players.map(function(p) { return p.name; });
        app.emit(socket, "connected", names, messages);
    });

    app.on("send-msg", function(socket, msg){
        messages.push(msg);
        app.emitAll("new-msg", msg);
    });

    return this;
};
