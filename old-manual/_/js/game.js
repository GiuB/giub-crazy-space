
//Canvas settings
var canvasWidth = 800,
	canvasHeight = 600;

$('#gameCanvas').attr('width', canvasWidth);
$('#gameCanvas').attr('height', canvasHeight);
var canvas = $('#gameCanvas')[0].getContext('2d');

//Global Defines
var root	= '_/',
	sprite  = root + 'sprite/',
	FPS		= 35;

//Sprites
var	image = new Image();
	image.src = sprite+'player.png';

//Others Defines
var playerX = ((canvasWidth/2) - (image.width / 2)),
	playerY = ((canvasHeight/2) - (image.height / 2)),
	keysDown = {};

//Track Keydown / Up
$('body').bind('keydown', function(e) {
	keysDown[e.which] = true;
});
$('body').bind('keyup', function(e) {
	keysDown[e.which] = false;
});

//Set Input Loop interation
setInterval(function() {
	update();
	draw();
}, 1000 / FPS);

function update() {
	if(keysDown[37]) {
		playerX -= 10;
	}
	if(keysDown[38]) {
		playerY -= 10;
	}
	if(keysDown[39]) {
		playerX += 10;
	}
	if(keysDown[40]) {
		playerY += 10;
	}

	playerX = clamp(playerX, 0, canvasWidth - image.width);
	playerY = clamp(playerY, 0, canvasHeight - image.height);
}

function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

function draw() {
	canvas.clearRect(0, 0, canvasWidth, canvasHeight);

	//Load Sprites
	canvas.strokeRect(0, 0, canvasWidth, canvasHeight);
	canvas.drawImage(image, playerX, playerY);
}

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

//Disabilitare lo scroll della pagina Up & Down
disable_scroll();
function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}

