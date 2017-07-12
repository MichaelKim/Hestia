document.getElementById("btn").onclick = function(){
  submit();
};

document.getElementById("input").onkeypress = function(e){
  if(!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if(keyCode === 13){
    submit();
    return false;
  }
};

function submit(){
  var msg = document.getElementById("input").value;
  app.emit("send-msg", msg);
}

function addMessage(msg) {
  var textarea = document.getElementById("output");
  textarea.innerHTML += msg + "\n";
  textarea.scrollTop = textarea.scrollHeight;
}

app.on("new-msg", function(msg){
  addMessage(msg);
});

app.joined = function(name) {
  addMessage('Welcome ' + name + '!');
}

app.left = function(name) {
  addMessage('Goodbye ' + name + '!');
}
