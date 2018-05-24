/* @flow */

export type Socket = {|
  emit(string, string, any): void
|};

export type Player = {|
  +id: string,
  +name: string,
  room: number,
  role: number
|};

export opaque type RoomID = number;
