function setupSocket(socket){
    socket.on("error-msg", function(message) {
        showError(message);
    });

    socket.on("room-created", function(newId, appNames) {
        console.log("Created room: " + newId);
        setRoom(newId);
        setHost(true);
        setApp(-1);
        waiting.innerHTML = "Pick an App to Run";
        loadAppsList(appNames);
    });

    socket.on("room-joined", function(newId, appNames) {
        console.log("Joined room: " + newId);
        setRoom(newId);
        setHost(false);
        setApp(-1);
        waiting.innerHTML = "Waiting for Host to Pick";
        loadAppsList(appNames);
    });

    socket.on("app-changed", function(appId) {
        console.log("app changed to " + appId);
        setApp(appId);
        waiting.innerHTML = "Loading app";
    });

    socket.on("player-joined", function(name) {
        names.push(name);
        console.log(names);
        appBox.contentWindow.app._joined(name);
    });

    socket.on("player-left", function(name) {
        var index = names.indexOf(name);
        if(index > -1) {
            names.splice(index, 1);
        }
        appBox.contentWindow.app._left(name);
        console.log(names);
    });

    socket.on("host-changed", function() {
        console.log("changed to host");
        setHost(true);
    });

    socket.on("app-selected", function(data) {
        console.log("retrived app: ");
        console.log(data.html);
        console.log(data.js);
        console.log(data.users);
        loadApp(data); //contains .html and .js
    });

    socket.on("data-app-server", function() {
        var args = Array.prototype.slice.call(arguments);
        console.log("data from server app: " + args);
        // TODO: when app isn't loaded yet, this method fails
        appBox.contentWindow.app.execute(args[0], args.slice(1));
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
