/* @flow */

export type Socket = {|
  on(eventName: string, callback: Function): void,
  emit(eventName: string, ...data: any): void,
  disconnect(number): void,
  id: PlayerID
|};

// Players

export type Player = {
  +id: PlayerID,
  name: string,
  room: RoomID,
  role: number
};

export type PlayerID = string;

// Rooms

export type Room = {
  +id: RoomID,
  players: PlayerID[],
  app: AppID
};

export type RoomID = number;

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

export type AppID = string;
