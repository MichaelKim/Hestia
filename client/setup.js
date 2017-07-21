var waiting = document.getElementById("waiting");
var names = [];

function loadAppsList(appNames) {
    console.log(appNames);
    var wrapper = document.getElementById("wrapper");
    var header = document.getElementById("header-title");
    wrapper.style.display = "block";
    header.style.display = "none";

    var applist = document.getElementById("app-list");

    while(applist.firstChild) {
        applist.removeChild(applist.firstChild);
    }

    for(var i = 0; i < appNames.length; ++i){
        applist.appendChild(createAppButton(appNames[i], i));
    }
}

function createAppButton(name, index) {
    var newbtn = document.createElement("button");
    newbtn.innerHTML = name;
    newbtn.onclick = function() {
        console.log("select app " + index);
        socket.emit("selectApp", index);
    };
    return newbtn;
}

function loadApp(appName) {
    var wrapper = document.getElementById("wrapper");
    wrapper.style.display = "none";
    appBox.style.display = "block";
    appBox.src = "https://hestia-apps.herokuapp.com/" + appName;
}

function executeApp(eventName, args) {
    console.log('EXECUTE');
    console.log(args);
    appBox.contentWindow.postMessage({
        type: "on",
        eventName: eventName,
        args: args
    }, "*");
}

function joinedApp(name) {
    appBox.contentWindow.postMessage({
        type: "joined",
        args: name
    }, "*");
}

function leftApp(name) {
    appBox.contentWindow.postMessage({
        type: "left",
        args: name
    }, "*");
}

function setupAppWindow() {
    window.addEventListener("message", function(event) {
        if(event.origin.indexOf('https://hestia-apps.herokuapp.com') === -1) {
            return;
        }

        if(event.data.type === 'emit') {
            var eventName = event.data.eventName;
            var args = event.data.args;
            console.log(eventName, args)
            socket.emit("dataApp", eventName, args);
        }
    }, false);
}
