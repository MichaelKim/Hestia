var can = document.getElementById("can");
var ctx = can.getContext("2d");
ctx.clearRect(0, 0, can.width, can.height);
ctx.fillStyle = "black";

var drawing = false; //mouse down
var prev;

function getPos(event){
  var rect = can.getBoundingClientRect();
  return { x: event.clientX - rect.left,
           y: event.clientY - rect.top };
}
function getTouchPos(event){
  var rect = can.getBoundingClientRect();
  var touch = event.touches[0];
  return { x: touch.clientX - rect.left,
           y: touch.clientY - rect.top };
}

can.addEventListener("mousedown", function(event){
  drawing = true;
  prev = getPos(event);
});
can.addEventListener("touchstart", function(event){
  drawing = true;
  prev = getTouchPos(event);
});

can.addEventListener("mouseup", function(event){
  drawing = false;
});
can.addEventListener("touchend", function(event){
  drawing = false;
});

can.addEventListener("mousemove", function(event){
  if(drawing){
    var curr = getPos(event);
    app.emit("send", prev, curr);
    prev = curr;
  }
});
can.addEventListener("touchmove", function(event){
  if(drawing){
    var curr = getTouchPos(event);
    app.emit("send", prev, curr);
    prev = curr;
  }
});

app.on("draw", function(a, b){
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
});
