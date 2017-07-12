function serverApp(app){

  this.sockets = app.sockets;
  this.ons = app.ons;
  this.on = app.on;
  this.emit = app.emit;
  this.emitAll = app.emitAll;
  this.execute = app.execute;

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
