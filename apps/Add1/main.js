//alert("hello!");
app.execute = function(args){
  console.log(args[0]);
  (app._ons[args[0]]).apply(app._ons[args[0]], args.slice(1));
};




app.document.getElementById("btn").onclick = function(){
  var num = app.document.getElementById("input-num").value;
  app.emit("button-press", num);
};

var count = app.document.getElementById("count");

app.on("newCount", function(num){
  count.innerHTML = num;
});


/*

to access the DOM, use app.document

to emit a message to the server,
  app.emit( NAME, [...args] )

to await a message from the server,
  app.on( NAME, function( [...args] ){ ... });


*/
