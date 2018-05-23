let btnBox = document.getElementById('btn-box');
let contBtn = document.getElementById('cont-btn');
let specBtn = document.getElementById('spec-btn');

let contBox = document.getElementById('cont-box');
let topBtn = document.getElementById('top-btn');
let leftBtn = document.getElementById('left-btn');
let rightBtn = document.getElementById('right-btn');
let bottomBtn = document.getElementById('bottom-btn');

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

contBtn.onclick = function() {
	app.emit('select', 0);

	btnBox.style.display = 'none';
	contBox.style.display = 'block';

	topBtn.onmousedown = topBtn.ontouchstart = () => app.emit('move', 0, -1);
	topBtn.onmouseup = topBtn.ontouchend = () => app.emit('move', 0, 1);

	leftBtn.onmousedown = leftBtn.ontouchstart = () => app.emit('move', -1, 0);
	leftBtn.onmouseup = leftBtn.ontouchend = () => app.emit('move', 1, 0);

	rightBtn.onmousedown = rightBtn.ontouchstart = () => app.emit('move', 1, 0);
	rightBtn.onmouseup = rightBtn.ontouchend = () => app.emit('move', -1, 0);

	bottomBtn.onmousedown = bottomBtn.ontouchstart = () => app.emit('move', 0, 1);
	bottomBtn.onmouseup = bottomBtn.ontouchend = () => app.emit('move', 0, -1);
}

specBtn.onclick = function() {
	app.emit('select', 1);

	btnBox.style.display = 'none';
	canvas.style.display = 'block';

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    context.textAlign = 'center';
    context.font = '20px sans-serif';
}

app.on('draw', function(positions) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	positions.forEach(p => {
		context.fillRect(p[0], p[1], 50, 50);
		context.fillText(p[2], p[0] + 25, p[1] - 10);
	});
});