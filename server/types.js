/* @flow */

export type Socket = {|
  on(eventName: string, callback: Function): void,
  emit(eventName: string, ...data: any): void,
  disconnect(number): void,
  id: PlayerID
|};

// Players

export type Player = {|
  +id: PlayerID,
  name: string,
  room: RoomID,
  role: number
|};

export opaque type PlayerID: string = string;

export function toPlayerID(id: string): PlayerID {
  return id;
}

// Rooms

export type Room = {|
  +id: RoomID,
  host: PlayerID,
  players: Player[],
  app: AppID
|};

export opaque type RoomID: number = number;

export function toRoomID(id: number): RoomID {
  return id;
}

// App

export type App = {|
  +players: { [PlayerID]: Player },
  +ons: Object,
  on(eventName: string, callback: Function): void,
  emit(socketId: PlayerID, eventName: string, ...data: any): void,
  emitAll(eventName: string, ...data: any): void,
  execute(eventName: string, socketId: PlayerID, data: any): void,
  joined(id: PlayerID, name: string, role: number): void,
  left(id: PlayerID, name: string, role: number): void,
  onload(): void,
  connect(id: PlayerID): any[],
  quit(): void
|};

export opaque type AppID: number = number;

export function toAppID(id: number): AppID {
  return id;
}
