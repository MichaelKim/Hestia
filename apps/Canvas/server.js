function serverApp(app){

    app.onload = function() {
        var styles = {};
        for(var id in app.players) {
            // Generating random color for each player
            styles[id] = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
        }
    };

    app.on("send", function(socket, prev, curr){
        app.emitAll("draw", styles[socket.id], prev, curr);
    });

    return app;

}

module.exports = serverApp;
