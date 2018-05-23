var config = {
    "tileSize": 50,  //side length of tile (tiles are square)
    "radius": 100,   //radius of light
    "pradius": 200, //radius of player light
    "border": 300,   //border where scrolling begins
    "playerSize": 24 //side length of player (player is square)
};
var lightLength = 5*60*1000; //5 minutes
var plightDecay = 0.0005;
var rooms = require('./room.json');

function serverApp(app){
    var players = {};
    var lights = [];
    var campfires = [];
    for(var i=0;i<rooms.length;i++){
        lights.push([]);
        campfires.push(rooms[i].campfire);
        rooms[i].width = rooms[i].grid[0].length * config.tileSize;
        rooms[i].height = rooms[i].grid.length * config.tileSize;
    }

    var moveInterval = setInterval(movePlayers, 16);
    var updateInterval = setInterval(update, 16);

    app.connect = function(id) {
        return {
            player: {
                x: rooms[0].startx * config.tileSize,
                y: rooms[0].starty * config.tileSize,
                light: 1.0,
                hue: Math.round(Math.random() * 360),
                room: 0,
                roomWidth: rooms[0].width,
                roomHeight: rooms[0].height,
                dead: false
            },
            others: getOthers(id),
            room: rooms[0].grid,
            campfires: campfires[0]
        };
    };

    app.on("confirm", function(id, player, screenWidth, screenHeight){
        player.id = id;
        player.move = {
            up: false,
            down: false,
            left: false,
            right: false,
        };
        player.screenWidth = screenWidth;
        player.screenHeight = screenHeight;

        players[id] = player;
        console.log("New Player: " + id);

        app.emitAll("newNumPlayers", Object.keys(players).length);
    });

    app.on("respawn", function(id){
        players[id].x = rooms[players[id].room].startx * config.tileSize;
        players[id].y = rooms[players[id].room].starty * config.tileSize;
        players[id].move = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        players[id].dead = false;

        app.emit(id, "respawn", {
            x: players[id].x,
            y: players[id].y,
            light: players[id].light,
            hue: players[id].hue,
            roomWidth: rooms[players[id].room].width,
            roomHeight: rooms[players[id].room].height,
            dead: false
        }, getOthers(id), players[id].room, rooms[players[id].room].grid, campfires[players[id].room]);
    });

    app.on("playerMove", function(id, data){
        players[id].move.up = data & 1;
        players[id].move.down = data & 2;
        players[id].move.left = data & 4;
        players[id].move.right = data & 8;
    });

    app.on("resize", function(id, screenWidth, screenHeight){
        players[id].screenWidth = screenWidth;
        players[id].screenHeight = screenHeight;
    });

    app.on("ping", function(id, date){
        app.emit(id, "pong", date);
    });

    app.left = function(id, name, role) {
        delete players[id]
        console.log("Player dc: " + id);
        app.emitAll("newNumPlayers", Object.keys(players).length);
    };

    app.quit = function() {
        clearInterval(moveInterval);
        clearInterval(updateInterval);
    }

    function clamp(num, min, max){
        return Math.min(Math.max(num, min), max);
    }

    function findLight(id, room){
        for(var i=0;i<lights[room].length;i++){
            if(id === lights[room].id) return i;
        }
        return -1;
    }

    function newLight(xx, yy, room){
        var newid = (xx + yy) * (xx + yy + 1) / 2 + yy;
        lights[room].push({x: xx, y: yy, id: newid, fade: 1.0});
        setTimeout(function(){
            var int = setInterval(function(){
                var index = findLight(newid, room);
                if(index > -1){
                    lights[room][index].fade -= 0.02;
                    if(lights[room][index].fade <= 0){
                        lights[room].splice(index, 1);
                        clearInterval(int);
                    }
                }
            }, 20);
        }, lightLength);
    }

    function getOthers(currId) {
        var others = [];
        Object.keys(players).forEach(function(currId) {
            var p = players[currId];
            if(p.id !== currId) {
                others.push({
                    x: p.x,
                    y: p.y,
                    light: p.light,
                    hue: p.hue
                });
            }
        });
        return others;
    }

    function loadNextLevel(player){
        player.room++;
        if(player.room >= rooms.length) player.room = rooms.length - 1;
        player.x = rooms[player.room].startx * config.tileSize;
        player.y = rooms[player.room].starty * config.tileSize;
        player.light = 1.0;

        app.emit(player.id, "newRoom", {
            x: player.x,
            y: player.y,
            light: player.light,
            hue: player.hue,
            roomWidth: rooms[player.room].width,
            roomHeight: rooms[player.room].height,
            dead: player.dead
        }, player.room, rooms[player.room].grid, campfires[player.room]);
    }

    function movePlayers(){
        Object.keys(players).forEach(function(id) {
            var p = players[id];
            if(p.dead) return;

            //decay player light
            if(p.light > 0) p.light -= plightDecay;
            if(p.light < 0) p.light = 0;

            //move player
            var pRoom = p.room;
            if(p.move.up) p.y -= 5;
            if(p.move.down) p.y += 5;
            if(p.move.left) p.x -= 5;
            if(p.move.right) p.x += 5;

            p.x = clamp(p.x, config.playerSize/2, rooms[pRoom].width-config.playerSize/2-1);
            p.y = clamp(p.y, config.playerSize/2, rooms[pRoom].height-config.playerSize/2-1);

            var top = (p.y-config.playerSize/2)/config.tileSize >> 0;
            var bottom = (p.y+config.playerSize/2)/config.tileSize >> 0;
            var left = (p.x-config.playerSize/2)/config.tileSize >> 0;
            var right = (p.x+config.playerSize/2)/config.tileSize >> 0;

            if(rooms[pRoom].grid[top][left] === "1" || rooms[pRoom].grid[top][right] === "1" ||
            rooms[pRoom].grid[bottom][left] === "1" || rooms[pRoom].grid[bottom][right] === "1"){

                p.dead = true;
                app.emit(id, "dead");
                newLight(p.x, p.y, pRoom);

                return;
            }

            if(rooms[pRoom].grid[top][left] === "2" || rooms[pRoom].grid[top][right] === "2" ||
            rooms[pRoom].grid[bottom][left] === "2" || rooms[pRoom].grid[bottom][right] === "2"){

                loadNextLevel(p);

                return;
            }

            for(var j=0;j<campfires[pRoom].length;j++){ //refresh player light
                if((left === campfires[pRoom][j].x || right === campfires[pRoom][j].x) &&
                (top === campfires[pRoom][j].y || bottom === campfires[pRoom][j].y)){

                    p.light = 1.0;
                }
            }
        });
    }

    function update(){
        Object.keys(players).forEach(function(id){
            var p = players[id];
            if(p.dead) return;

            var player = {x: p.x, y: p.y, light: p.light};

            var others = [];
            Object.keys(players).forEach(function(id2){
                var pp = players[id2];
                if(p.id !== pp.id &&
                    p.room === pp.room &&
                    pp.x+config.pradius > p.x-p.screenWidth &&
                    pp.x-config.pradius < p.x+p.screenWidth &&
                    pp.y+config.pradius > p.y-p.screenHeight &&
                    pp.y-config.pradius < p.y+p.screenHeight) others.push({x: pp.x, y: pp.y, hue: pp.hue, light: pp.light});
            });

            var lightsSection = [];
            for(var j=0;j<lights[p.room].length;j++){
                if(lights[p.room][j].x+config.radius > p.x-p.screenWidth &&
                    lights[p.room][j].x-config.radius < p.x+p.screenWidth &&
                    lights[p.room][j].y+config.radius > p.y-p.screenHeight &&
                    lights[p.room][j].y-config.radius < p.y+p.screenHeight) lightsSection.push(lights[p.room][j]);
            }

            app.emit(id, "update", player, others, lightsSection);
        });
    }

    return app;
};

module.exports = serverApp;
