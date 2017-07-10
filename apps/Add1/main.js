app.document.getElementById("btn").onclick = function(){
  var num = app.document.getElementById("input-num").value;
  app.emit("button-press", num);
};

var count = app.document.getElementById("count");

app.on("newCount", function(num){
  count.innerHTML = num;
});
