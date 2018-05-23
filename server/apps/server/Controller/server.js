const Role = {
    CONTROLLER: 0,
    SPECTATOR: 1
};
const MAXSPEED = 10;

function serverApp(app) {

    let loopInterval;
    let controllers = [];
    let spectators = [];

    app.onload = function () {
        loopInterval = setInterval(gameLoop, 1000/30);
    }

    app.on('select', function(id, choice) {
        app.players[id].choice = choice;
        if (choice === Role.CONTROLLER) {
            controllers.push(id);
            app.players[id] = Object.assign(app.players[id], {
                x: 0,  // Position
                y: 0,
                vx: 0, // Direction of movement
                vy: 0,
                rx: 0, // Real velocity
                ry: 0
            });
        }
        else if (choice === Role.SPECTATOR) {
            spectators.push(id);
        }
    });

    app.on('move', function(id, x, y) {
        if (app.players[id].choice === Role.CONTROLLER) {
            app.players[id].vx += x;
            app.players[id].vy += y;
        }
    });

    function gameLoop() {
        let positions = [];
        controllers.forEach(id => {
            if (app.players[id].choice === Role.CONTROLLER) {
                let targetx = (app.players[id].vx > 0) ? MAXSPEED : (app.players[id].vx < 0) ? -MAXSPEED : 0;
                let targety = (app.players[id].vy > 0) ? MAXSPEED : (app.players[id].vy < 0) ? -MAXSPEED : 0;
                app.players[id].rx += (targetx - app.players[id].rx) * 0.5;
                app.players[id].ry += (targety - app.players[id].ry) * 0.5;

                app.players[id].x += app.players[id].rx;
                app.players[id].y += app.players[id].ry;
                positions.push([app.players[id].x, app.players[id].y, app.players[id].name]);
            }
        });
        spectators.forEach(id => {
            if (app.players[id].choice === Role.SPECTATOR) {
                app.emit(id, 'draw', positions);
            }
        });
    }

    app.left = function(id) {
        let index = controllers.indexOf(id);
        if (index > -1) controllers.splice(index, 1);
        else {
            index = spectators.indexOf(id);
            if (index > -1) spectators.splice(index, 1);
        }
    };

    app.quit = function() {
        clearInterval(loopInterval);
    };

    return app;
};

module.exports = serverApp;
