alert("hello!");
app.document.getElementById("btn").onclick = function(){
  alert("You clicked me!");
};
app.emit("test", "hello from app");
