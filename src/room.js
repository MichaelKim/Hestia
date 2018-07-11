/* @flow */

import type { Player, PlayerID, Room, RoomID, AppID } from './types';

module.exports = () => {
  const rooms: { [RoomID]: Room } = {}; // From 0000 to 9999 (10000 rooms available)

  // Create a new randomly generated room
  function createRoom(room: Object): RoomID {
    const roomID = generateRoomID();

    rooms[roomID] = {
      ...room,
      id: roomID,
      app: ''
    };

    return roomID;
  }

  function joinRoom(id: PlayerID, roomID: RoomID): boolean {
    if (rooms[roomID]) {
      rooms[roomID].players.push(id);
      return true;
    } else {
      return false;
    }
  }

  function getPlayers(rid: RoomID): PlayerID[] {
    if (rooms[rid]) {
      return rooms[rid].players;
    }
    return [];
  }

  function leaveRoom(roomID: RoomID, playerID: PlayerID) {
    if (!rooms[roomID]) return;

    if (rooms[roomID].players.length === 1) {
      delete rooms[roomID];
    } else {
      const index = rooms[roomID].players.findIndex(pid => pid === playerID);
      rooms[roomID].players.splice(index, 1);
    }
  }

  function getRoom(rid: RoomID) {
    return rooms[rid];
  }

  function getRooms() {
    return rooms;
  }

  function editRoom(rid: RoomID, editFn: Room => Room) {
    rooms[rid] = editFn(rooms[rid]);
  }

  function getAppName(roomID: RoomID): AppID {
    if (rooms[roomID]) {
      return rooms[roomID].app;
    }
    return '';
  }

  function setAppName(roomID: RoomID, appID: AppID) {
    if (rooms[roomID]) {
      rooms[roomID].app = appID;
    }
  }

  function generateRoomID(): RoomID {
    let id = Math.floor(Math.random() * 10000);
    while (id in rooms) {
      id = Math.floor(Math.random() * 10000);
    }
    return id;
  }

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    getRooms,
    editRoom,
    getPlayers,
    getAppName,
    setAppName
  };
};
