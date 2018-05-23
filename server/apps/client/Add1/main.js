var count = document.getElementById("count");

document.getElementById('btn').onclick = function(){
    var num = document.getElementById("input-num").value;
    app.emit("button-press", num);
};

app.on("newCount", function(num){
    count.innerHTML = num;
});
