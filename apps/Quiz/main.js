var question = app.document.getElementById("question");
var reply = app.document.getElementById("reply");

for(var i=0;i<4;i++){
  initBtn(i);
}
function initBtn(i){
  app.document.getElementById("btn" + (i+1)).onclick = function(){
    app.emit("answer", i+1);
  };
}

app.document.getElementById("ask").onclick = function(){
  app.emit("ask");
};

app.on("question", function(q){
  reply.innerHTML = "";
  question.innerHTML = q;
});

app.on("reply", function(ans){
  if(ans){
    reply.innerHTML = "Correct!";
  }
  else{
    reply.innerHTML = "Incorrect!";
  }
});
