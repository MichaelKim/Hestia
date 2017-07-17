function serverApp(app){

    var player1, player2;
    var boardState = [[], [], [], [], [], [], []]; //7 columns
    var maxHeight = 6;
    var currTurn = 0;

    function chkLine(a,b,r,c) {
        // Check first cell non-zero and all cells match
        return (a && b && r && c && (a !== 0) && (a === b) && (a === r) && (a === c));
    }

    function checkTie() {
    	for (var a = 0; a < boardState.length; a++) {
    		if (boardState[a] != maxHeight) {
    			return false;
    		}
    	}
    	return true;
    }

    function checkWin() {
        var c, r;
        var bd = boardState;

        // Check down
        for (c = 0; c < 4; c++)
            for (r = 0; r < 6; r++)
                if (chkLine(bd[c][r], bd[c+1][r], bd[c+2][r], bd[c+3][r]))
                    return bd[c][r];

        // Check right
        for (c = 0; c < 7; c++)
            for (r = 0; r < 3; r++)
                if (chkLine(bd[c][r], bd[c][r+1], bd[c][r+2], bd[c][r+3]))
                    return bd[c][r];

        // Check down-right
        for (c = 0; c < 4; c++)
            for (r = 0; r < 3; r++)
                if (chkLine(bd[c][r], bd[c+1][r+1], bd[c+2][r+2], bd[c+3][r+3]))
                    return bd[c][r];

        // Check down-left
        for (c = 3; c < 7; c++)
            for (r = 0; r < 3; r++)
                if (chkLine(bd[c][r], bd[c-1][r+1], bd[c-2][r+2], bd[c-3][r+3]))
                    return bd[c][r];

        return !checkTie() - 1;
    }

    app.on("start", function(socket) {
        if(player1 === undefined) {
            app.emit(socket, "connected", 1);
            player1 = socket.id;
            console.log("Player 1 joined");
        }
        else if(player2 === undefined) {
            app.emit(socket, "connected", 2);
            player2 = socket.id;
            console.log("Player 2 joined");
        }
        else {
            app.emit(socket, "connected", 0);
            console.log("Spectator joined");
        }
        app.emit(socket, "newBoard", boardState);

        if(player1 && player2) {
            app.emit(app.players[player1].socket, "turn");
            currTurn = 1;
        }
    });

    app.on("placePiece", function(socket, col) {
        console.log("Placing piece at " + col);
        var player = (socket.id === player1) ? 1 : (socket.id === player2) ? 2 : 0;
        if(player === 1 || player === 2) {
            console.log("Player " + player);
            if(currTurn !== player) {
                app.emit(socket, "errorMsg", "It is not your turn yet");
            }
            else if(col < 0 || col > boardState.length - 1 || boardState[col].length >= maxHeight) {
                app.emit(socket, "errorMsg", "Invalid piece placement");
            }
            else {
                console.log("Pushed");
                boardState[col].push(player);

                app.emitAll("newBoard", boardState);

                var win = checkWin();
                if (win !== 0) {
                    app.emitAll("winner", win);
                    setTimeout(function () {
                        boardState = [[], [], [], [], [], [], []];
                        currTurn = 1;

                        app.emitAll("reset");

                        app.emit(app.players[player1].socket, "turn");
                    }, 5000);
                }
                else {
                    if (currTurn === 1) {
                        currTurn = 2;
                        app.emit(app.players[player2].socket, "turn");
                    }
                    else {
                        currTurn = 1;
                        app.emit(app.players[player1].socket, "turn");
                    }
                }
            }
        }
        else {
            app.emit(socket, "errorMsg", "Player is spectator, canoot play");
        }
    });

    app.left = function(id, name, role) {
        if(player1 === id) {
            console.log("Player 1 left");
            player1 = undefined;
        }
        else if(player2 === id) {
            console.log("Player 2 left");
            player2 = undefined;
        }
    };

    return app;
};

module.exports = serverApp;
