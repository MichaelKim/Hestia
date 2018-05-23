function serverApp(app){

    app.on("button-press", function(id, num){
        console.log("recieved: " + num);
        if(isNaN(num)){
            app.emitAll("newCount", "that's not a number!");
        }
        else{
            app.emitAll("newCount", parseInt(num)+1);
        }
    });

    return app;
}

module.exports = serverApp;
