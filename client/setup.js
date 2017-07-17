var waiting = document.getElementById("waiting");
var names = [];

function loadAppsList(appNames) {
    console.log(appNames);
    var wrapper = document.getElementById("wrapper");
    var header = document.getElementById("header-title");
    wrapper.style.display = "block";
    header.style.display = "none";

    var applist = document.getElementById("app-list");

    while(applist.firstChild) {
        applist.removeChild(applist.firstChild);
    }

    for(var i = 0; i < appNames.length; ++i){
        applist.appendChild(createAppButton(appNames[i], i));
    }
}

function createAppButton(name, index) {
    var newbtn = document.createElement("button");
    newbtn.innerHTML = name;
    newbtn.onclick = function() {
        console.log("select app " + index);
        socket.emit("selectApp", index);
    };
    return newbtn;
}

function loadApp(data) {
    var wrapper = document.getElementById("wrapper");
    wrapper.style.display = "none";
    appBox.style.display = "block";

    var iframe = appBox.contentWindow || (appBox.contentDocument.document || appBox.contentDocument);

    iframe.document.open();
    iframe.document.write(data.html);
    iframe.document.close();

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = data.js;

    var jquery = document.createElement("script");
    jquery.type = "text/javascript";
    jquery.src = "https://code.jquery.com/jquery-3.2.1.min.js";
    jquery.onload = function() {
        iframe.document.body.appendChild(script);
    };

    iframe.document.body.appendChild(jquery);
    console.log(jquery);
}

function setupAppWindow() {
    window.addEventListener("message", function(event) {
        console.log(event.origin);
        console.log(event.data);
        if(event.data.type === 'emit') {
            var args = event.data.args;
            args.unshift("dataApp");
            console.log(args);
            socket.emit.apply(socket, args);
        }
    }, false);
}
