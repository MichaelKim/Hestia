function serverApp(app){
    var styles = {};

    app.onload = function() {
        for(var id in app.players) {
            // Generating random color for each player
            styles[id] = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
            console.log(styles[id]);
        }
    };

    app.on("send", function(id, prev, curr){
        if(styles[id] === undefined) {
            app.emitAll("draw", "#000000", prev, curr);
        }
        else {
            app.emitAll("draw", styles[id], prev, curr);
        }
    });

    return app;

}

module.exports = serverApp;
