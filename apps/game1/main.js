//alert("hello!");
var count = app.document.getElementById("count");

app.document.getElementById("btn").onclick = function(){
  app.emit("button-press");
};

app.on("newCount", function(num){
  count.innerHTML = num;
});

app.on("test", function(msg, msg2){
  console.log("hello world, " + msg + " and " + msg2);
});
