//alert("hello!");
app.execute = function(args){
  console.log(args[0]);
  (app._ons[args[0]]).apply(app._ons[args[0]], args.slice(1));
};

var count = app.document.getElementById("count");

app.document.getElementById("btn").onclick = function(){
  app.emit("button-press");
};

app.on("newCount", function(num){
  count.innerHTML = num;
});

app.on("test", function(){
  console.log("test hello world");
});
