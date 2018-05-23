var output = document.getElementById("output");
var multi = document.getElementById("multi");
var count = 0, average = 0, defaultMulti = 10;

document.getElementById("btn").onclick = function() {
    if(!count) {
        app.emit("ping", +new Date());
    }
};

document.getElementById("btn2").onclick = function() {
    count = parseInt(multi.value) || defaultMulti;
    output.innerHTML += "Checking " + count + " times:\n";
    app.emit("ping", +new Date());
};

app.on("pong", function(time) {
    var ping = new Date() - time;
    if(count > 0) {
        average += ping;
        output.innerHTML += ping + " ";
        if(count > 1) {
            app.emit("ping", +new Date());
        }
        else {
            output.innerHTML += "\nAverage ping: " + (average / (parseInt(multi.value) || defaultMulti)) + "\n";
            average = 0;
        }
        count -= 1;
    }
    else {
        output.innerHTML += "Ping: " + ping + "\n";
    }
    output.scrollTop = output.scrollHeight;
})
