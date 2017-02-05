module.exports = {

  rooms: [], //from 0000 to 9999 (10000 rooms available)

  //create a new randomly generated room, setting the player "host" as the host
  createRoom: function(host){
    var roomid = this.generateRoomId();
    host.room = roomid;
    host.host = true;
    var newRoom = {
      id: roomid, //is this necessary
      host: host.id,
      players: [host]
    };
    this.rooms[roomid] = newRoom;

    console.log("rooms.createRoom: room " + roomid + " is created; host: " + host.id);
  },

  //let player "player" join room with id "room"
  joinRoom: function(roomId, player){
    player.room = roomId;
    player.host = false;
    this.rooms[roomId].players.push(player);

    console.log("rooms.joinRoom: room " + roomId + " joined; player: " + player.id);
  },

  // "player" leaves room they're currently in
  leaveRoom: function(player){
    if(this.rooms[player.room] === undefined){
      console.log("room " + player.room + " not found");
      return;
    }

    var roomPlayers = this.rooms[player.room].players; //room the player was in
    for(var i = 0; i < roomPlayers.length; i++){
      if(roomPlayers[i].id === player.id){ //found the player
        roomPlayers.splice(i, 1);
        console.log("player " + player.id + " left room " + player.room);

        var newHostId = 0;

        if(roomPlayers.length === 0){ //no one left in the room
          console.log("empty room " + player.room + ", deleting");
          delete this.rooms[player.room];
        }
        else if(this.rooms[player.room].host === player.id){ //player leaving was the host, pick a new host
          console.log("room " + player.room + ", host switched to " + roomPlayers[0].id);
          this.rooms[player.room].host = roomPlayers[0].id;
          roomPlayers[0].host = true;

          newHostId = roomPlayers[0].id;
        }
        player.room = -1;
        player.host = false;

        return newHostId;
      }
    }
  },

  generateRoomId: function(){
    var id = Math.floor(Math.random() * 10000);
    while(id in this.rooms) id = Math.floor(Math.random() * 10000);
    return id;
  }
};
