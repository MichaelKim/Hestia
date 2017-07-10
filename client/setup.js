var waiting = document.getElementById("waiting");

/* HTML5 magics */
HTMLElement.prototype.createShadowRoot =
    HTMLElement.prototype.createShadowRoot ||
    HTMLElement.prototype.webkitCreateShadowRoot ||
    function () {};

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
    //appBox.socket = socket;

    data.js = "var app = document.getElementById('app-box');" +
              "app.execute = function(args){" +
              "console.log(args[0]);" +
              "(app._ons[args[0]]).apply(app._ons[args[0]], args.slice(1));" +
              "};" +  data.js;
    appBox.root = data;
}

function setupAppWindow() {
    customElements.define("app-window", class extends HTMLElement {
        constructor() {
            super();

            this._ons = []; //{name: "name of call", func: "function that runs"}
            this._root = appBox.attachShadow({ mode: "open" });
        }

        set root(appdata) {
            var temp = document.createElement("template");
            temp.innerHTML = appdata.html + "<script type='text/javascript'>" +
                             "(function(){" + appdata.js +
                             "})();</script>";

            this._root.appendChild(document.importNode(temp.content, true));
        }

        get document(){
            return this._root;
        }

        /*set socket(s) {
            this._socket = s;
        }

        get socket() {
            return this._socket;
        }*/

        emit() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("dataApp");
            console.log(args);
            socket.emit.apply(socket, args);
        }

        on() {
            var args = Array.prototype.slice.call(arguments);
            this._ons[args[0]] = args[1];
            console.log("Add on: " + args[0]);
            console.log(args[1]);
        }
    });
}
