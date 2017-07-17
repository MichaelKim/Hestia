function serverApp(app){

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

    return app;
};

module.exports = serverApp;
