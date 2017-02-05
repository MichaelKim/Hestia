function serverApp(app){

  this.sockets = app.sockets;
  this.ons = app.ons;
  this.on = app.on;
  this.emit = app.emit;
  this.emitAll = app.emitAll;
  this.execute = app.execute;

  app.on("send-msg", function(socket, msg){
    app.emitAll("new-msg", msg);
  });

  return this;

}

module.exports = serverApp;
