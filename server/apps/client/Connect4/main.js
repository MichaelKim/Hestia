// client.js

var boardState = clearBoard();

// Drawing
var canvas;
var ctx;

var padding = 20;
var boxSize = 64;
var pieceSize = 54;
var gridWidth = 7; // 7 cols
var gridHeight = 6; // 6 rows
var gameHeight = gridHeight * boxSize + 2 * padding;
var gameWidth = gridWidth * boxSize + 2 * padding;
var isCurrentTurn = false;
var player = 0;

$(document).ready(function() {
    canvas = $(".gameCanvas")[0];
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    ctx = canvas.getContext("2d");

    // Init Squares
    drawBoard();

    // Setup connection
    setupSocket();

    $(".gameWrapper").mousemove(function (event) {
        if (isCurrentTurn) {
            var leftOffset = $(".gameCanvas").offset().left + padding;
            var index = parseInt((event.pageX - leftOffset) / $("#u0").height());
            for (var i = 0; i < gridWidth; i++) {
                if (index != i) {
                    $("#u" + i + " canvas").css("opacity", "0");
                }
                else {
                    $("#u" + i + " canvas").css("opacity", "1");
                }
            }
        }
    });
	setHeaderText("Waiting for server...");
});

function setHeaderText(s) {
	$(".header").html(s);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 4;

	var leftX = (gameWidth - (gridWidth * boxSize)) / 2;
	ctx.fillStyle = "#1750aa";
	ctx.fillRect(leftX, gameHeight - (gridHeight * boxSize) - padding, gameWidth - leftX - padding, gameHeight - padding * 2);
	ctx.beginPath();
    // Draw Boxes
    for (var i = 0; i < gridWidth + 1; i++) {
        // Verticals
        ctx.moveTo(leftX + (i * boxSize), gameHeight - padding);
		ctx.lineTo(leftX + (i * boxSize), gameHeight - (gridHeight * boxSize) - padding);
    }
    for (var i = 0; i < gridHeight + 1; i++) {
        // Horizontals
        ctx.moveTo(leftX, gameHeight - (i * boxSize) - padding);
        ctx.lineTo(gameWidth - leftX, gameHeight - (i * boxSize) - padding);
    }
    ctx.strokeStyle = "#0d326b";
    ctx.stroke();
    // Draw the Circles
    for (var col = 0; col < boardState.length; col++) {
        for (var row = 0; row < boardState[col].length; row++) {
            ctx.beginPath();
            ctx.arc(leftX + ((col + 0.5) * boxSize), gameHeight - ((row + 0.5) * boxSize) - padding, pieceSize / 2, 0, 2 * Math.PI);
            if (boardState[col][row] == 1) {
                ctx.fillStyle = "red";
            }
            else {
                ctx.fillStyle = "yellow";
            }
            ctx.fill();
        }
    }
}

function initUserControl() {
    console.log('user');
    // Init User Control after Sockets
    for (var i = 0; i < gridWidth; i++) {
        var newDiv = $("<div id='u" + i + "'><canvas height='" + pieceSize + "' width='" + pieceSize + "'></canvas></div>");
        // newDiv.height(boxSize);
        // newDiv.width(boxSize);
        newDiv.height("14%");
        newDiv.width("14%");
        newDiv.click(function () {
            console.log("CLICK");
            handlePushPiece($(this).attr("id"));
        });
        $(".userControl").append(newDiv);
        var ctx = newDiv.find("canvas")[0].getContext("2d");
       	ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(pieceSize / 2, pieceSize / 2, pieceSize / 2, 0, 2 * Math.PI);
        if (player == 1) {
            ctx.fillStyle = "red";
        }
        else {
            ctx.fillStyle = "yellow";
        }
        ctx.fill();
    }
}

function handlePushPiece(id) {
    console.log('click', isCurrentTurn);
	if (isCurrentTurn) {
		var col = parseInt(id.replace(/\D/g, ''));
		if (boardState[col].length < gridHeight) {
			app.emit("placePiece", col);
			isCurrentTurn = false;
			setHeaderText("Waiting for opponent...");
		}
    }
}

function setupSocket() {
    app.on("connected", function(role) {
		player = role;
		if (player == 0) {
			setHeaderText("You are spectating...");
		}
		else {
			setHeaderText("Waiting for player...");
		}
		initUserControl();
    });

    app.on("newBoard", function(board) {
        console.log('new board');
        boardState = board;
        drawBoard();
    });

    app.on("turn", function() {
        console.log("my turn");
		isCurrentTurn = true;
		setHeaderText("Your turn!");
    })

	app.on("winner", function (winner) {
		if (player == winner) {
			setHeaderText("You've won! Game will reset soon...");
		}
		else if (winner == -1) {
			setHeaderText("It's a tie! Game will reset soon...");
		}
		else if (player != 0) {
			setHeaderText("You lost! Game will reset soon...");
		}
		else {
			setHeaderText("Player " + winner + " won! Game will reset soon...");
		}
    });

	app.on("reset", function () {
		boardState = clearBoard();
		drawBoard();
		setHeaderText("Waiting to start...");
	});

    app.on("errorMsg", function(msg) {
        console.log(msg);
    });

    app.emit("start");
}

function clearBoard() {
	var res = [];
	for (var i = 0; i < gridWidth; i++) {
		res.push([]);
	}
	return res;
}
