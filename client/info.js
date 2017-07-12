/* Info panel */
var roomInfo = document.getElementById("room-info");
var hostInfo = document.getElementById("host-info");
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

function setHost(host) {
    hostInfo.innerHTML = "Host: " + (host ? "true" : "false");
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
    setHost(false);
    setRoom("N/A");
}
