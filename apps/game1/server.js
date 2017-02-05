function serverApp(app){

  this.sockets = app.sockets;
  this.ons = app.ons;
  this.on = app.on;
  this.emit = app.emit;
  this.emitAll = app.emitAll;
  this.execute = app.execute;

  app.on("button-press", function(socket, num){
    console.log("recieved: " + num);
    app.emitAll("newCount", parseInt(num)+1);
  });

  return this;

}

module.exports = serverApp;

/*

to await a message from a client,
  app.on( NAME, function( SOCKET, [...args] ){ ... });
where SOCKET is the socket of the client who sent the message

to send a message to a client socket,
  app.emit( SOCKET, NAME, [...args] );

to send a message to all clients in the room,
  app.emitAll( NAME, [...args] );
note that there is no socket mentioned, unlike the single client message

*/
