app.document.getElementById("btn").onclick = function(){
  var msg = app.document.getElementById("input").value;
  app.emit("send-msg", msg);
};

app.on("new-msg", function(msg){
  var textarea = app.document.getElementById("output");
  textarea.innerHTML += msg + "\n";
  textarea.scrollTop = textarea.scrollHeight;
});
