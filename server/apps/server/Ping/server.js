function serverApp(app){

    app.on("ping", function(id, time) {
        app.emit(id, "pong", time);
    });

    return app;
};

module.exports = serverApp;
