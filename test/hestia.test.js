const http = {
  on: jest.fn()
};

jest.mock('socket.io', () =>
  jest.fn(srv => {
    return {
      _ons: {},
      on: jest.fn(function(eventName, callback) {
        this._ons[eventName] = callback;
      })
    };
  })
);

describe('sanity', () => {
  it('2 + 2 = 4', () => {
    expect(2 + 2).toBe(4);
  });
});

describe('socket.io mock', () => {
  it('creating io object', () => {
    const io = require('socket.io')();
    expect(io).toHaveProperty('on');
  });
});

describe('hestia init', () => {
  it('create with new', () => {
    const Hestia = require('../src/index');
    const h = new Hestia(http);

    expect(h).toHaveProperty('on');
  });

  it('create without new', () => {
    const h = require('../src/index')(http);

    expect(h).toHaveProperty('on');
  });
});

describe('hestia connection', () => {
  const h = require('../src/index')(http);

  // Test socket
  const socket = {
    on: jest.fn((eventName, callback) => {}),
    emit: jest.fn((eventName, ...data) => {}),
    disconnect: jest.fn(val => {}),
    id: 'playerid'
  };

  it('h.io', () => {
    expect(h.io).toHaveProperty('on');
    expect(h.io.on).toHaveBeenCalledTimes(1);
    expect(h.io._ons).toHaveProperty('connection');
  });

  it('connection', () => {
    h.io._ons['connection'](socket);

    expect(socket.on).toHaveBeenCalledTimes(2);
  });

  it('getSocket', () => {
    expect(h.getSocket('playerid')).toMatchObject(socket);
  });
});

describe('hestia', () => {
  it('addPlayer, getPlayer', () => {
    const h = require('../src/index')(http);
    const player = {
      id: 'foo',
      asdf: 1
    };

    h.addPlayer(player);
    expect(h.getPlayer('foo')).toMatchObject(player);
  });

  it('editPlayer', () => {
    const h = require('../src/index')(http);
    h.addPlayer({ id: 'foo', name: 'dingus' });

    expect(h.getPlayer('foo').name).toBe('dingus');

    h.editPlayer('foo', p => ({
      ...p,
      name: 'world'
    }));

    expect(h.getPlayer('foo').name).toBe('world');
  });

  it('createRoom, getRoom', () => {
    const h = require('../src/index')(http);
    const rid = h.createRoom({});
    expect(rid).toBeGreaterThan(-1);

    const room = h.getRoom(rid);
    expect(room).toHaveProperty('id');
    expect(room.id).toBe(rid);
  });

  it('createRoom with players', () => {
    const h = require('../src/index')(http);
    h.addPlayer({ id: 'test1' });
    h.addPlayer({ id: 'test2' });

    const rid = h.createRoom({
      players: ['test1', 'test2']
    });

    expect(h.getRoom(rid).players).toEqual(['test1', 'test2']);
    expect(h.getPlayer('test1').room).toBe(rid);
    expect(h.getPlayer('test2').room).toBe(rid);
  });

  it('createRoom with non-existant player', () => {
    const h = require('../src/index')(http);

    const rid = h.createRoom({
      players: ['asdf']
    });

    expect(h.getRoom(rid).players).toEqual([]);
  });

  it('createRoom with no players', () => {
    const h = require('../src/index')(http);
    const rid = h.createRoom({});
    const rid2 = h.createRoom();

    expect(h.getRoom(rid).players).toEqual([]);
    expect(h.getRoom(rid2).players).toEqual([]);
  });

  it('createRoom: cannot override id or app', () => {
    const h = require('../src/index')(http);
    const rid = h.createRoom({
      id: 'foo',
      app: 'bar'
    });

    const room = h.getRoom(rid);
    expect(room.id).not.toBe('foo');
    expect(room.app).toBe('');
  });

  it('editRoom', () => {
    const h = require('../src/index')(http);

    const rid = h.createRoom({ name: 'foo' });

    expect(h.getRoom(rid).name).toBe('foo');

    h.editRoom(rid, r => ({
      ...r,
      name: 'bar'
    }));

    expect(h.getRoom(rid).name).toBe('bar');
  });

  it('joinRoom, leaveRoom', () => {
    const h = require('../src/index')(http);

    const rid = h.createRoom({});
    h.addPlayer({ id: 'boo' });
    h.addPlayer({ id: 'far' });

    const success1 = h.joinRoom(rid, 'boo');
    const success2 = h.joinRoom(rid, 'far');

    expect(success1).toBe(true);
    expect(success2).toBe(true);

    expect(h.getPlayer('boo').room).toBe(rid);
    expect(h.getRoom(rid).players).toEqual(['boo', 'far']);

    h.leaveRoom('boo');

    expect(h.getPlayer('boo').room).toBe(-1);
    expect(h.getRoom(rid).players).toEqual(['far']);
  });

  it('join non-existant room', () => {
    const h = require('../src/index')(http);

    h.addPlayer({ id: 'boo' });
    const success = h.joinRoom(123, 'boo');

    expect(success).toBe(false);
  });

  it('leaveRoom with one player', () => {
    const h = require('../src/index')(http);

    const rid = h.createRoom({});
    h.addPlayer({ id: 'boo' });
    h.joinRoom(rid, 'boo');
    h.leaveRoom('boo');

    expect(h.getRoom(rid)).toBe(undefined);
  });

  it('getPlayers of non-existant room', () => {
    const h = require('../src/index')(http);

    expect(h.getPlayers(123)).toEqual([]);
  });

  it('getRooms', () => {
    const h = require('../src/index')(http);

    expect(h.getRooms()).toEqual({});

    const rid = h.createRoom({});

    expect(h.getRooms()).toEqual({
      [rid]: {
        id: rid,
        app: '',
        players: []
      }
    });
  });

  it('getAppName', () => {
    const h = require('../src/index')(http);
    const rid = h.createRoom({});

    expect(h.getAppName(rid)).toBe('');
  });
});
