function setupSocket(socket){
    socket.on("error-msg", function(message) {
        showError(message);
    });

    socket.on("room-created", function(newId, appNames) {
        console.log("Created room: " + newId);
        setRoom(newId);
        setRole(0);
        setApp(-1);
        waiting.innerHTML = "Pick an App to Run";
        loadAppsList(appNames);
    });

    socket.on("room-joined", function(newId, appNames) {
        console.log("Joined room: " + newId);
        setRoom(newId);
        setRole(1);
        setApp(-1);
        waiting.innerHTML = "Waiting for Host to Pick";
        loadAppsList(appNames);
    });

    socket.on("app-changed", function(appId, appName) {
        console.log("app changed to " + appId);
        setApp(appId);
        loadApp(appName);
        waiting.innerHTML = "Loading app";
    });

    socket.on("player-joined", function(name) {
        names.push(name);
        console.log(names);
        joinedApp(name);
    });

    socket.on("player-left", function(name) {
        var index = names.indexOf(name);
        if(index > -1) {
            names.splice(index, 1);
        }
        leftApp(name);
    });

    socket.on("role-changed", function(role) {
        console.log("changed role: " + role);
        setRole(role);
    });

    socket.on("data-app-server", function(eventName, args) {
        console.log("data from server app: " + eventName, args);
        executeApp(eventName, args);
    });

    socket.on("leave-app", function(appNames) {
        loadAppsList(appNames);
        waiting.innerHTML = "Pick an App to Run";
        leaveApp();
    });

    socket.on("leave-room", function() {
        leaveRoom();
    });
}
