function serverApp(app){

    var messages = [];

    app.on("send-msg", function(id, msg){
        messages.push(msg);
        var p = app.players[id];
        app.emitAll("new-msg", p.name + ", " + p.role + ": " + msg);
    });

    app.connect = function() {
        return messages;
    }

    return app;
};

module.exports = serverApp;
