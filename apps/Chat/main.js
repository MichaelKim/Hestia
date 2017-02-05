app.document.getElementById("btn").onclick = function(){
  submit();
};

app.document.getElementById("input").onkeypress = function(e){
  if(!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if(keyCode === 13){
    submit();
    return false;
  }
};

function submit(){
  var msg = app.document.getElementById("input").value;
  app.emit("send-msg", msg);
}

app.on("new-msg", function(msg){
  var textarea = app.document.getElementById("output");
  textarea.innerHTML += msg + "\n";
  textarea.scrollTop = textarea.scrollHeight;
});
