var waiting = document.getElementById("waiting");
var names = [];

var appHeader = 'var app = {\
    _ons: [],\
    _names: [],\
    _joined: function(name) {\
        this._names.push(name);\
        this.joined(name);\
    },\
    _left: function(name) {\
        var index = this._names.indexOf(name);\
        if(index > -1) {\
            this._names.splice(index, 1);\
        }\
        this.left(name);\
    },\
\
    on: function(eventName, callback) {\
        this._ons[eventName] = callback;\
    },\
    emit: function() {\
        window.parent.postMessage({\
            type: "emit",\
            args: Array.prototype.slice.call(arguments)\
        }, "*");\
    },\
    execute: function(eventName, args) {\
        console.log(eventName, args);\
        app._ons[eventName].apply(this, args);\
    },\
    names: function() {\
        return this._names;\
    },\
    joined: function(name) {\
        console.log("player " + name + " joined");\
    },\
    left: function(name) {\
        console.log("player " + name + " left");\
    }\
};';

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

function loadApp(data) {
    var wrapper = document.getElementById("wrapper");
    wrapper.style.display = "none";
    appBox.style.display = "block";

    var iframe = appBox.contentWindow || ( appBox.contentDocument.document || appBox.contentDocument);

    iframe.document.open();
    iframe.document.write(data.html);
    iframe.document.close();

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = appHeader + data.js;

    appBox.contentWindow.document.body.appendChild(script);
}

function setupAppWindow() {
    window.addEventListener("message", function(event) {
        console.log(event.origin);
        console.log(event.data);
        if(event.data.type === 'emit') {
            var args = event.data.args;
            args.unshift("dataApp");
            console.log(args);
            socket.emit.apply(socket, args);
        }
    }, false);
}
