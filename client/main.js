var socket;
var loaded = false;

window.onload = function () {
    var joinBtn = document.getElementById("join-btn"); //join room button
    var createBtn = document.getElementById("create-btn"); //create room button
    var roomId = document.getElementById("room-id"); //room id (when creating room)
    var name = document.getElementById("name"); //player name

    var leaveInfo = document.getElementById("leave-info");

    joinBtn.onclick = function () {
        if(validId(roomId.value)) {
            startGame(roomId.value, name.value);
        }
        else {
            showError("Invalid room ID");
        }
    };

    createBtn.onclick = function() {
        startGame("create", name.value);
    };

    leaveInfo.onclick = function() {
        socket.emit("leave");
    };
};

function startGame(option, name) {
    socket = io();
    setupSocket(socket);
    if(!loaded) {
        setupAppWindow();
    }
    loaded = true;

    if(option === "create") {
        socket.emit("startCreate", name);
    }
    else {
        socket.emit("startJoin", name, option); //player name, room id
    }
}

function validId(id) {
    return parseInt(id) && parseInt(id) >= 0 && parseInt(id) <= 9999;
}
