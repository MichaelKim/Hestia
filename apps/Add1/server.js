function serverApp(app){

    this.players = app.players;
    this.ons = app.ons;
    this.on = app.on;
    this.emit = app.emit;
    this.emitAll = app.emitAll;
    this.execute = app.execute;
    this.onload = app.onload;
    this.connect = app.connect;

    app.on("button-press", function(socket, num){
        console.log("recieved: " + num);
        if(isNaN(num)){
            app.emitAll("newCount", "that's not a number!");
        }
        else{
            app.emitAll("newCount", parseInt(num)+1);
        }
    });

    return this;
}

module.exports = serverApp;
