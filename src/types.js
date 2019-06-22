/* @flow strict */

export type EventData = mixed[];

export type Socket = {|
  on(
    eventName: string,
    callback: (eventName: string, data: EventData) => void
  ): void,
  emit(eventName: string, ...data: EventData): void,
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

type AppCallback = (socketId: PlayerID, ...data?: EventData) => void;
export type AppPlayers = { [PlayerID]: Player };
export type App = {|
  +players: AppPlayers,
  +ons: {| +[eventName: string]: AppCallback |},
  on(eventName: string, callback: AppCallback): void,
  emit(socketId: PlayerID, eventName: string, ...data: EventData): void,
  emitAll(eventName: string, ...data: EventData): void,
  execute(eventName: string, socketId: PlayerID, data: EventData): void,
  joined(id: PlayerID, name: string, role: number): void,
  left(id: PlayerID, name: string, role: number): void,
  onload(): void,
  connect(id: PlayerID): EventData,
  quit(): void
|};

export type AppID = string;
