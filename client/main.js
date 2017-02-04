var socket;

/* Start screen */
var joinBtn, createBtn, roomId;
var error;

/* Select app screen */
var appId, selectBtn;

window.onload = function(){
  joinBtn = document.getElementById("join-btn"); //join room button
  createBtn = document.getElementById("create-btn"); //create room button
  roomId = document.getElementById("room-id"); //room id (when creating room)
  error = document.getElementById("error");

  appId = document.getElementById("app-id"); //app id (when selecting app as host)
  selectBtn = document.getElementById("select-btn"); //enter button for appId

  joinBtn.onclick = function(){
    if(validId(roomId.value)){
      startGame(roomId.value);
    }
    else showError("Invalid room ID");
  };

  createBtn.onclick = function(){
    startGame("create");
  };

  selectBtn.onclick = function(){
    console.log("select app " + appId.value);
    socket.emit("selectApp", appId.value);
  };


  function startGame(option){
    if(!socket){
      socket = io();
      setupSocket();
    }

    if(option === "create") socket.emit("startCreate");
    else socket.emit("startJoin", option);
  }

  function setupSocket(){
    socket.on("error-msg", function(message){
      showError(message);
    });

    socket.on("room-created", function(newId, appNames){
      console.log("Created room: " + newId);
      loadApps(appNames);
    });

    socket.on("room-joined", function(newId, appNames){
      console.log("Joined room: " + newId);
      loadApps(appNames);
    });
  }

  function validId(id){
    return parseInt(id) >= 0 && parseInt(id) <= 9999; //maybe change this to direct string checking
  }

};


function loadApps(appNames){
  console.log(appNames);
  var wrapper = document.getElementById("wrapper");
  var header = document.getElementById("header-title");
  wrapper.style.display = "block";
  header.style.display = "none";

  var applist = document.getElementById("app-list");

  for(var i=0;i<appNames.length;i++){
    var newapp = document.createElement("li");
    var appname = document.createElement("p");
    appname.innerHTML = appNames[i];
    newapp.appendChild(appname);
    applist.appendChild(newapp);
  }
}



var errorInterval;
function showError(message){
  error.innerHTML = "Error: " + message;
  if(errorInterval) clearTimeout(errorInterval);
  errorInterval = setTimeout(function(){
    error.innerHTML = "";
  }, 2000);
}
