/* @flow */

export type Socket = {|
  emit(string, string, any): void
|};

export type Player = {|
  +id: number,
  +name: string,
  room: number,
  role: number
|};

export opaque type RoomID = number;
