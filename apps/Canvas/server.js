function serverApp(app){

  this.players = app.players;
  this.ons = app.ons;
  this.on = app.on;
  this.emit = app.emit;
  this.emitAll = app.emitAll;
  this.execute = app.execute;

  app.on("send", function(socket, prev, curr){
    app.emitAll("draw", prev, curr);
  });

  return this;

}

module.exports = serverApp;
