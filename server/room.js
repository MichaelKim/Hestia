/* @flow */

import { toRoomID, toAppID } from './types';
import type { Player, PlayerID, Room, RoomID, AppID } from './types';

const rooms: { [RoomID]: Room } = {}; // From 0000 to 9999 (10000 rooms available)

// Create a new randomly generated room, setting the player "host" as the host
export function createRoom(host: Player) {
  const roomid = generateRoomId();
  host.room = roomid;
  host.role = 0;

  const newRoom: Room = {
    id: roomid, //is this necessary
    host: host.id,
    players: [host],
    app: toAppID(-1)
  };
  rooms[roomid] = newRoom;

  console.log('rooms.createRoom: room ' + roomid + ' is created; host: ' + host.id);
}

// Let player "player" join room with id "room"
export function joinRoom(roomId: RoomID, player: Player) {
  player.room = roomId;
  player.role = 1;
  rooms[roomId].players.push(player);

  console.log('rooms.joinRoom: room ' + roomId + ' joined; player: ' + player.id);
}

// "player" leaves room they're currently in
export function leaveRoom(player: Player): ?PlayerID {
  if (!roomExists(player.room)) {
    console.log('room ' + player.room + ' not found');
    return;
  }

  const roomPlayers = getPlayers(player.room); // Room the player was in
  for (let i = 0; i < roomPlayers.length; i++) {
    if (roomPlayers[i].id === player.id) {
      //found the player
      roomPlayers.splice(i, 1);
      console.log('player ' + player.id + ' left room ' + player.room);

      let newHostId = undefined;

      if (roomPlayers.length === 0) {
        //no one left in the room
        console.log('empty room ' + player.room + ', deleting');
        delete rooms[player.room];
      } else if (rooms[player.room].host === player.id) {
        //player leaving was the host, pick a new host
        console.log('room ' + player.room + ', host switched to ' + roomPlayers[0].id);
        rooms[player.room].host = roomPlayers[0].id;
        roomPlayers[0].role = 0;

        newHostId = roomPlayers[0].id;
      }

      player.room = toRoomID(-1);
      player.role = -1;

      return newHostId;
    }
  }
}

export function generateRoomId(): RoomID {
  let id = Math.floor(Math.random() * 10000);
  while (id in rooms) {
    id = Math.floor(Math.random() * 10000);
  }
  return toRoomID(id);
}

export function roomExists(roomId: RoomID): boolean {
  return rooms[roomId] !== undefined;
}

export function getAppId(roomId: RoomID): AppID {
  if (roomExists(roomId)) {
    return rooms[roomId].app;
  }
  return toAppID(-1);
}

export function setAppId(roomId: RoomID, appId: AppID) {
  rooms[roomId].app = appId;
}

export function getPlayers(roomId: RoomID): Player[] {
  return rooms[roomId].players;
}
