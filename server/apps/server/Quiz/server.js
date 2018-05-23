function serverApp(app){

    var qa = [
        ["What is the fourth letter of the alphabet?\n1: A\n 2: B\n 3: C\n 4: D", 4],
        ["Water Water Water\n1: what?\n2: loo loo loo\n3: hail feridun\n4: thankmrgoose", 2],
        ["What is the unladen airspeed velocity of a swallow?\n1: Huh, I don't know that\n2: What do you mean, African or European?\n3: Unknown\n4: 11 m/s", 4]
    ];

    var qindex = -1;

    app.on("ask", function() {
        qindex++;
        if(qindex >= qa.length) {
            qindex = 0;
        }
        app.emitAll("question", qa[qindex][0]);
    });

    app.on("answer", function(id, ans) {
        console.log(ans);
        console.log(qa[qindex]);
        app.emit(id, "reply", ans === qa[qindex][1]);
    });

    return app;
}

module.exports = serverApp;
