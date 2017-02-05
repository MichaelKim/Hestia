var socket;
var loaded = false;

/* Start screen */
var joinBtn, createBtn, roomId;
var error;

/* Select app screen */
var appId, selectBtn;

/* Info panel */
var roomInfo, hostInfo, appInfo, leaveInfo;

/* App container */
var appBox;

/* HTML5 magics */
HTMLElement.prototype.createShadowRoot =
  HTMLElement.prototype.createShadowRoot ||
  HTMLElement.prototype.webkitCreateShadowRoot ||
  function() {};

window.onload = function(){
  joinBtn = document.getElementById("join-btn"); //join room button
  createBtn = document.getElementById("create-btn"); //create room button
  roomId = document.getElementById("room-id"); //room id (when creating room)
  error = document.getElementById("error");

  appId = document.getElementById("app-id"); //app id (when selecting app as host)
  selectBtn = document.getElementById("select-btn"); //enter button for appId

  roomInfo = document.getElementById("room-info");
  hostInfo = document.getElementById("host-info");
  appInfo = document.getElementById("app-info");
  leaveInfo = document.getElementById("leave-info");
  appBox = document.getElementById("app-box");

  joinBtn.onclick = function(){
    if(validId(roomId.value)){
      startGame(roomId.value);
    }
    else showError("Invalid room ID");
  };

  createBtn.onclick = function(){
    startGame("create");
  };

  /*selectBtn.onclick = function(){
    console.log("select app " + appId.value);
    socket.emit("selectApp", appId.value);
  };*/

  leaveInfo.onclick = function(){
    var header = document.getElementById("header-title");
    var wrapper = document.getElementById("wrapper");
    if(wrapper.style.display !== "none"){
      leaveRoom();
    }
    else if(header.style.display === "none"){
      leaveApp();
      socket.emit("leaveApp");
    }
  };


  function startGame(option){
    if(!socket){
      socket = io();
    }
    else{
      socket.socket.connect();
    }
    if(!loaded){
      setupSocket();
      setupAppWindow();
    }
    if(option === "create") socket.emit("startCreate");
    else socket.emit("startJoin", option);
    loaded = true;
  }

  function setupSocket(){
    socket.on("error-msg", function(message){
      showError(message);
    });

    socket.on("room-created", function(newId, appNames){
      console.log("Created room: " + newId);
      roomInfo.innerHTML = "Room: " + newId;
      hostInfo.innerHTML = "Host: true";
      appInfo.innerHTML = "App: not selected";
      loadAppsList(appNames);
    });

    socket.on("room-joined", function(newId, appNames, appId){
      console.log("Joined room: " + newId);
      roomInfo.innerHTML = "Room: " + newId;
      hostInfo.innerHTML = "Host: false";
      if(appId === -1) appInfo.innerHTML = "App: not selected";
      else appInfo.innerHTML = "App: " + appId;
      loadAppsList(appNames);
    });

    socket.on("app-changed", function(appId){
      console.log("app changed to " + appId);
      appInfo.innerHTML = "App: " + appId;
    });

    socket.on("host-changed", function(hostId){
      console.log("changed to host");
      hostInfo.innerHTML = "Host: true";
    });

    socket.on("app-selected", function(data){
      console.log("retrived app: ");
      console.log(data.html);
      console.log(data.js);
      loadApp(data); //contains .html and .js
    });

    socket.on("data-app-server", function(){
      var args = Array.prototype.slice.call(arguments);
      console.log("data from server app: " + args);
      appBox.execute(args);
    });

    socket.on("leave-app", function(){
      leaveApp();
    });

    socket.on("leave-room", function(){
      leaveRoom();
    });
  }

  function validId(id){
    return parseInt(id) >= 0 && parseInt(id) <= 9999; //maybe change this to direct string checking
  }

};

function setupAppWindow(){
  customElements.define("app-window", class extends HTMLElement{
    constructor(){
      super();

      this._ons = []; //{name: "name of call", func: "function that runs"}
      this._root = appBox.attachShadow({ mode: "open" });
    }

    set root(appdata){
      var temp = document.createElement("template");
      temp.innerHTML = appdata.html + "<script type='text/javascript'>" +
                      "(function(){" + appdata.js +
                      "})();</script>";

      this._root.appendChild(document.importNode(temp.content, true));
    }

    get document(){
      return this._root;
    }

    /*set socket(s){
      this._socket = s;
    }

    get socket(){
      return this._socket;
    }*/

    emit(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift("dataApp");
      console.log(args);
      socket.emit.apply(socket, args);
    }

    on(){
      var args = Array.prototype.slice.call(arguments);
      this._ons[args[0]] = args[1];
      console.log("Add on: " + args[0]);
      console.log(args[1]);
    }
  });
}


function loadAppsList(appNames){
  console.log(appNames);
  var wrapper = document.getElementById("wrapper");
  var header = document.getElementById("header-title");
  wrapper.style.display = "block";
  header.style.display = "none";

  var applist = document.getElementById("app-list");

  for(var i=0;i<appNames.length;i++){
    applist.appendChild(createAppButton(appNames[i], i));
  }
}

function createAppButton(name, index){
  var newbtn = document.createElement("button");
  newbtn.innerHTML = name;
  newbtn.onclick = function(){
    console.log("select app " + index);
    socket.emit("selectApp", index);
  };
  return newbtn;
}

function loadApp(data){
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

function leaveApp(){
  var wrapper = document.getElementById("wrapper");
  console.log("back to apps");
  appBox.shadowRoot.innerHTML = "";
  appBox.style.display = "none";
  wrapper.style.display = "block";
}

function leaveRoom(){
  var header = document.getElementById("header-title");
  var wrapper = document.getElementById("wrapper");
  console.log("back to main");
  wrapper.style.display = "none";
  header.style.display = "block";

  socket.disconnect();
}


var errorInterval;
function showError(message){
  error.innerHTML = "Error: " + message;
  if(errorInterval) clearTimeout(errorInterval);
  errorInterval = setTimeout(function(){
    error.innerHTML = "";
  }, 2000);
}
