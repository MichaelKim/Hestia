/* Info panel */
var roomInfo = document.getElementById("room-info");
var roleInfo = document.getElementById("role-info");
var appInfo = document.getElementById("app-info");

/* Error message */
var errorInterval;
var error = document.getElementById("error");

/* Display utils */
var header = document.getElementById("header-title");
var wrapper = document.getElementById("wrapper");
var appBox = document.getElementById("app-box");

function setRoom(room) {
    roomInfo.innerHTML = "Room: " + room;
}

function setRole(role) {
    console.log("set role: " + role);
    var roleStr = "N/A";
    if(role === 0) roleStr = "Host";
    else if(role === 1) roleStr = "Player";
    else if(role === 2) roleStr = "Spectator";
    roleInfo.innerHTML = "Role: " + roleStr;
}

function setApp(app) {
    appInfo.innerHTML = "App: " + (app < 0 ? "not selected" : app);
}

function showError(message){
    error.innerHTML = "Error: " + message;
    if(errorInterval) {
        clearTimeout(errorInterval);
    }
    errorInterval = setTimeout(function() {
        error.innerHTML = "";
    }, 2000);
}

function leaveApp() {
    console.log("Back to apps");
    appBox.innerHTML = "";
    appBox.style.display = "none";
    wrapper.style.display = "block";
    header.style.display = "none";

    setApp(-1);
}

function leaveRoom(){
    console.log("Back to main");
    appBox.innerHTML = "";
    appBox.style.display = "none";
    wrapper.style.display = "none";
    header.style.display = "block";

    setApp(-1);
    setRole(-1);
    setRoom("N/A");
}
