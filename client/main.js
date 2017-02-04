var socket;
var joinBtn, createBtn, roomId;
var error;

window.onload = function(){
  joinBtn = document.getElementById("join-btn"); //join room button
  createBtn = document.getElementById("create-btn"); //create room button
  roomId = document.getElementById("room-id"); //room id (when creating room)
  error = document.getElementById("error");

  joinBtn.onclick = function(){
    if(validId(roomId.value)){
      startGame(roomId.value);
    }
    else showError("Invalid room ID");
  };

  createBtn.onclick = function(){
    startGame("create");
  };

};

function showError(message){
  error.innerHTML = "Error: " + message;
}

function validId(id){
  return parseInt(id) >= 0 && parseInt(id) <= 9999; //maybe change this to direct string checking
}

function startGame(option){
  if(!socket){
    socket = io();
    setupSocket();
  }

  if(option === "create") socket.emit("startCreate");
  else socket.emit("startJoin", option);
}


function setupSocket(){
  socket.on("room-dne", function(){
    showError("Room does not exist");
  });

  socket.on("room-created", function(newId){
    console.log("Created room: " + newId);
  });

  socket.on("room-joined", function(newId){
    console.log("Joined room: " + newId);
  });
}
