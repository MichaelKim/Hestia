function serverApp(app){

    var playing = [];
    var numPlayers = 2;

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

    app.on("start", function(id) {
        console.log(playing);
        var i = 0;
        while (i < numPlayers && playing[i]) i++;

        if (i < numPlayers) {
            playing[i] = id;
            app.emit(id, "connected", i + 1);
            console.log("Player " + (i + 1) + " joined");

            if (currTurn === 0 && i === numPlayers - 1) { // New game
                app.emit(playing[0], "turn");
                currTurn = 1;
            }
            else if (currTurn > 0) { // Someone left
                app.emit(playing[currTurn - 1], "turn");
            }
        }
        else {
            app.emit(id, "connected", 0);
            console.log("Spectator joined");
        }
        app.emit(id, "newBoard", boardState);
    });

    app.on("placePiece", function(id, col) {
        console.log("Placing piece at " + col);

        var i = 0;
        while (i < numPlayers && playing[i] !== id) i++;

        var player = (i === numPlayers) ? 0 : i + 1;

        if(player >= 1 && player <= numPlayers) {
            console.log("Player " + player);
            if(currTurn !== player) {
                app.emit(id, "errorMsg", "It is not your turn yet");
            }
            else if(col < 0 || col > boardState.length - 1 || boardState[col].length >= maxHeight) {
                app.emit(id, "errorMsg", "Invalid piece placement");
            }
            else {
                console.log("Pushed");
                boardState[col].push(player);

                app.emitAll("newBoard", boardState);

                var win = checkWin();
                if (win !== 0) {
                    currTurn = 0;
                    app.emitAll("winner", win);
                    setTimeout(function () {
                        boardState = [[], [], [], [], [], [], []];
                        currTurn = 1;

                        app.emitAll("reset");

                        app.emit(playing[0], "turn");
                    }, 5000);
                }
                else {
                    if (currTurn === 1) {
                        currTurn = 2;
                        app.emit(playing[1], "turn");
                    }
                    else {
                        currTurn = 1;
                        app.emit(playing[0], "turn");
                    }
                }
            }
        }
        else {
            app.emit(id, "errorMsg", "Player is spectator, canoot play");
        }
    });

    app.left = function(id, name, role) {
        var i = 0;
        while (i < numPlayers && playing[i] !== id) i++;

        if (i < numPlayers) {
            console.log("Player " + (i + 1) + " left");
            playing[i] = undefined;
        }
    };

    return app;
};

module.exports = serverApp;
