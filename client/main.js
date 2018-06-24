var socket;
var loaded = false;

window.onload = function() {
  var joinBtn = document.getElementById('join-btn'); //join room button
  var createBtn = document.getElementById('create-btn'); //create room button
  var roomId = document.getElementById('room-id'); //room id (when creating room)
  var name = document.getElementById('name'); //player name

  var leaveInfo = document.getElementById('leave-info');

  roomId.onkeypress = name.onkeypress = function(e) {
    let key = e.keyCode || e.which;
    if (key === 13) {
      if (roomId.value) join(roomId.value, name.value);
      else create(name.value);
    }
  };

  joinBtn.onclick = function() {
    join(roomId.value, name.value);
  };

  createBtn.onclick = function() {
    create(name.value);
  };

  leaveInfo.onclick = function() {
    socket.emit('leave');
  };
};

function join(room, name) {
  if (validId(room)) {
    startGame(room, name);
  } else {
    showError('Invalid room ID');
  }
}

function create(name) {
  startGame('create', name);
}

function startGame(option, name) {
  socket = io();
  setupSocket(socket);
  if (!loaded) {
    setupAppWindow();
  }
  loaded = true;

  if (screenfull.enabled) {
    // screenfull.request();
  }

  if (option === 'create') {
    socket.emit('startCreate', name);
  } else {
    socket.emit('startJoin', name, option); //player name, room id
  }
}

function validId(id) {
  return parseInt(id) && parseInt(id) >= 0 && parseInt(id) <= 9999;
}
