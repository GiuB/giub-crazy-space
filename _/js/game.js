var Q = Quintus()
			.include('Sprites, Anim, Input, Touch, Scenes, UI')
			.setup({ width: 800, height: 600, maximize: "touch" })
			.controls()
			.touch();

var n_enemy = 0;

Q.input.touchControls({
	controls: [
		['left', '<'],
		['right', '>'],
		[],
		[],
		[],
		[],
		['fire', 'a']
	]
});


Q.UI.Text.extend("Score",{
  init: function(p) {
    this._super({
      label: "score: 0",
      x: 100,
      y: 100
    });

    Q.state.on("change.score",this,"score");
  },

  score: function(score) {
    this.p.label = "score: " + score;
  }
});

//Direction limit control
function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

//Random range control
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Random Enemy Generator
function enemyGen() {
	if(n_enemy < 3) {
		stage.insert(new Q.Enemy_generator());
		n_enemy = n_enemy +1;
	}
}

Q.controls();
Q.setup({ maximize: true });

Q.scene('ScoreDisplay', function(stage, dt) {
	var container = stage.insert(new Q.UI.Container({
		x: Q.width, y: Q.height, fill: 'transparent'
	}));

	container.insert(new Q.UI.Text({
		x: -120 - stage.options.label.length, y: -15, fontWeight: '100', textShadow: "#000", color: '#fff', fill: '#FFFFFF', label: 'Survived time: ' + stage.options.label
	}));

	container.fit(10);
});

Q.Sprite.extend('Score', {
	init: function(p) {
		this._super(p, {
			score: 0,
			lifes : 1
		});

		this.p.inc_score = true;
	},
	step: function(dt) {
		function pad2(number) {
     		return (number < 10 ? '0' : '') + number;
   		}

		//Increment score
		if(!this.p.inc_score) {
			return;
		} else {
			var entity = this;
			setTimeout(function() {
				Q.state.inc('score', 1);
				entity.p.inc_score = true;
			}, 1000);
			var time = pad2(parseInt(Q.state.get('score') / 60))+':'+ pad2(parseInt(Q.state.get('score') % 60))+'s';
			Q.stageScene('ScoreDisplay', 1, { label: time });
			this.p.inc_score = false;
		}
	}
});

Q.Sprite.extend('Player', {
	init: function(p) {
		this._super(p, {
			//asset: 'player.png',
			sprite: 'player',
			sheet: 'player',
			x: Q.el.width /2,
			y: Q.el.height - 30,
			type: Q.SPRITE_FRIENDLY,
			speed: 10,
			collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_TILES
		});

		this.p.inc_score = true;
		this.add('animation');
		this.play('default');
		this.add('Gun');

		//Collision
		this.on("hit.sprite",this,"collision");
	},
	collision: function(col) {
		if(col.obj.isA('Shot') || col.obj.isA('Enemy2')) { //&& (col.obj.p.type & Q.SPRITE_ENEMY) == Q.SPRITE_ENEMY) {
			this.destroy();
			col.obj.destroy();
			Q.stageScene('endGame', 1, { label: 'You Died!' });
		}
	},
	step: function(dt) {
		if(Q.inputs['left'])
			this.p.x -= this.p.speed;
		if(Q.inputs['right'])
			this.p.x += this.p.speed;
		if(Q.inputs['up'])
			this.p.y -= this.p.speed;
		if(Q.inputs['down'])
			this.p.y += this.p.speed;

		this.p.x = clamp(this.p.x, 0 + (this.p.w / 2), Q.el.width - (this.p.w / 2));
		this.p.y = clamp(this.p.y, Q.el.height / 3, Q.el.height - 30);
		this.stage.collide(this);
	}
});

Q.Sprite.extend('Enemy1', {
	init: function(p) {
		this._super(p, {
			sprite: 'enemy01',
			sheet: 'enemy01',
			x: Q.el.width /2,
			speed: 200,
			collisionMask: Q.SPRITE_FRIENDLY | Q.SPRITE_TILES
		});

		this.p.y = this.p.h;
		this.add('animation');
		this.play('default');
		this.add('BasicAI');

		//Collision
		this.on("hit.sprite",this,"collision");
	},
	collision: function(col) {
		if(col.obj.isA('Shot')) {
			col.obj.destroy();
			//this.stage.insert(new Q.Enemy1());
			//this.destroy();
		}
	},
	step: function(dt) {
		this.stage.collide(this);
	}
});

Q.Sprite.extend('Enemy2', {
	init: function(p) {
		this._super(p, {
			sprite: 'enemy2',
			sheet: 'enemy2',
			x: getRandomInt(0, Q.width),
			speed: 200,
			collisionMask: Q.SPRITE_FRIENDLY | Q.SPRITE_TILES
		});

		this.p.y = this.p.h;
		this.add('animation');
		this.play('default');
		this.add('kamikazeAI');

		//Collision
		this.on("hit.sprite",this,"collision");
 	    this.add('2d, aiBounce');
	},
	collision: function(col) {
		if(col.obj.isA('Shot')) {
			this.stage.insert(new Q.Enemy2());
			this.destroy();
			col.obj.destroy();
		}
	},
	step: function(dt) {
		this.stage.collide(this);
	}
});

Q.component('kamikazeAI', {
	added: function() {
		this.entity.on('step', 'move');
		//Collision
		this.on("hit",this,"collision");
	},
	extend: {
		move: function(dt) {
			var player = Q('Player').first(),
				entity = this;
			if(!player) return;

			entity.p.y += entity.p.speed * dt;
			entity.p.x = (player.p.x < (entity.p.x-1) ? entity.p.x -2 : (player.p.x > (entity.p.x+1) ? entity.p.x +2 :entity.p.x));

			if(entity.p.y > Q.height) {
				entity.destroy();
				this.stage.insert(new Q.Enemy2());
			}
		}
	},
	collision: function(col) {
		//console.log('collision');
	},
	stomp: function(collision) {
	    if(collision.obj.isA("Enemy")) {
	      	collision.obj.destroy();
	      	this.p.vy = -500; // make the player jump
	    }
  	},
	step: function(dt) {
		this.stage.collide(this);
	}
});

Q.Sprite.extend('Shot', {
	init: function(p) {
		this._super(p, {
			sprite: ((p.type == 9)? 'shot2' : 'circle2'),
			sheet: ((p.type == 9)? 'shot2' : 'circle2'),
			speed: 350
		});

		this.add('animation');
		this.play('default');
	    //this.on("bump.bottom",this,"stomp");
	},
	step: function(dt) {
		this.p.y -= this.p.speed * dt;

		if(this.p.y > Q.el.height || this.p.y < 0) {
			this.destroy();
		}
	}
});

Q.component('BasicAI', {
	added: function() {
		this.entity.changeDirections();
		this.entity.on('step', 'move');
		this.entity.on('step', 'tryToFire');
		this.entity.add('Gun');
	},
	extend: {
		changeDirections: function() {
			var entity = this;
			var numberOfSeconds = Math.floor((Math.random() * 5)+1);
			if(entity.p.x <= 0 || entity.p.x >= Q.width) {
				entity.p.speed = -entity.p.speed;
				entity.changeDirections();
			}
			setTimeout(function() {
				entity.p.speed = -entity.p.speed;
				entity.changeDirections();
			}, numberOfSeconds * 1000);
		},
		move: function(dt) {
			var entity = this;
			entity.p.x -= entity.p.speed * dt;
			if(entity.p.x > Q.el.width - (entity.p.w /2) || entity.p.x < 0 + (entity.p.w /2)) {
				entity.p.speed = -entity.p.speed;
			}
		},
		tryToFire: function() {
			var player = Q('Player').first(),
				entity = this;
			if(!player) return;

			//Spara quando il giocatore è nel suo range Y
			if(player.p.x + (player.p.w * 2) > entity.p.x && player.p.x - (player.p.w * 2) < entity.p.x) {
				entity.fire(Q.SPRITE_ENEMY);
			}
		}
	}
});

Q.component('Gun', {
	added: function() {
		this.entity.p.shots = [];
		this.entity.p.canFire = true;
		this.entity.on('step', 'handleFiring');
	},
	extend : {
		handleFiring : function() {
			var entity = this;

			//Remove Destroyed shots
			for(var i = entity.p.shots.length -1; i > 0; i--) {
				if(entity.p.shots[i].isDestroyed) {
					entity.p.shots.splice(i, 1);
				}
			}

			if(Q.inputs['fire'] && entity.p.type == Q.SPRITE_FRIENDLY) {
				entity.fire(Q.SPRITE_FRIENDLY);
			}
		},
		fire: function(type) {
			var entity = this;

			//Exit if cannot fire
			if(!entity.p.canFire) {
				return;
			}

			var shot;
			if(type == Q.SPRITE_FRIENDLY) {
				shot = Q.stage().insert(new Q.Shot({ x: entity.p.x, y: entity.p.y - 38, speed: 350, type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY }));
			} else {
				shot = Q.stage().insert(new Q.Shot({ x: entity.p.x, y: entity.p.y - entity.p.h + 50, speed: -130, type: Q.SPRITE_DEFAULT | Q.SPRITE_ENEMY }));
			}
			entity.p.shots.push(shot);
			entity.p.canFire = false;

			if(type == Q.SPRITE_FRIENDLY) {
				setTimeout(function() {
					entity.p.canFire = true;
				}, 90);
			} else {
				setTimeout(function() {
					entity.p.canFire = true;
				}, 400);
			}
		}
	}
});

Q.scene('mainLevel', function(stage) {
	Q.state.set('score', 0);
	Q.gravity = 0;
	stage.insert(new Q.Sprite({ asset: 'background2.jpg', x: Q.el.width / 2, y: Q.el.height / 2, type: Q.SPRITE_NONE }));
	//stage.insert(new Q.Shot({ x: 100, y: 100 }));
	stage.insert(new Q.Player());
	stage.insert(new Q.Enemy1());
	stage.insert(new Q.Enemy2());
	stage.insert(new Q.Score());
	setTimeout(function() { stage.insert(new Q.Enemy2()); }, 300);
	setTimeout(function() { stage.insert(new Q.Enemy2()); }, 500);
	setTimeout(function() { stage.insert(new Q.Enemy2()); }, 800);
	setTimeout(function() { stage.insert(new Q.Enemy2()); }, 1100);
	if(Q.width >= 600) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 1400);
	} if(Q.width >= 800) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 1700);
	} if(Q.width >= 1000) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 2000);
		setTimeout(function() { stage.insert(new Q.Enemy1()); }, 1000);
	} if(Q.width >= 1200) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 2300);
	} if(Q.width >= 1400) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 2800);
		setTimeout(function() { stage.insert(new Q.Enemy1()); }, 2000);
	} if(Q.width >= 1600) {
		setTimeout(function() { stage.insert(new Q.Enemy2()); }, 3200);
		setTimeout(function() { stage.insert(new Q.Enemy1()); }, 2500);
	}
});

//Restart Game On Press Enter
Q.el.addEventListener("keydown",function(e) {
	if(e.keyCode == 13) {
		Q.pauseGame();
		Q.clearStages();
		Q.stageScene('mainLevel');
		console.log('test');
	}
},false);

Q.scene('endGame', function(stage, dt) {
	var container = stage.insert(new Q.UI.Container({
		x: Q.width /2, y: Q.height /2, fill: '#FFFFFF'
	}));

	var button = container.insert(new Q.UI.Button({
		x: 0, y: 0, fill: '#CCCCCC', label: 'Play again'
	}));

	container.insert(new Q.UI.Text({
		x: 10, y: -10 - button.p.h, fill: '#FFFFFF', label: stage.options.label
	}));

	button.on('click', function() {
		Q.pauseGame();
		Q.clearStages();
		Q.stageScene('mainLevel');
	});

	setTimeout(function() {
		Q.gameLoop(function(dt) {
		    Q.pauseGame();
		});
	}, 100);

	container.fit(20);
});

Q.load(['background2.jpg', 'player.png', 'player.json', 'shoot.png', 'shot.json', 'enemy1.png', 'enemy1.json', 'enemy2.png', 'enemy2.json', 'circle2.png', 'circle2.json', 'enemy01.png', 'enemy01.json', 'shot2.png', 'shot2.json'], function() {
	Q.compileSheets('player.png', 'player.json');
	Q.compileSheets('shoot.png', 'shot.json');
	Q.compileSheets('shot2.png', 'shot2.json');
	Q.compileSheets('enemy01.png', 'enemy01.json');
	Q.compileSheets('enemy2.png', 'enemy2.json');
	Q.compileSheets('circle2.png', 'circle2.json');
	Q.animations('player', { default: { frames: [0], rate: 1 }});
	Q.animations('shot', { default: { frames: [0, 1], rate: 1/2 }});
	Q.animations('shot2', { default: { frames: [0, 1], rate: 1/2 }});
	Q.animations('circle2', { default: { frames: [0], rate: 1 }});
	Q.animations('enemy01', { default: { frames: [0], rate: 1 }});
	Q.animations('enemy2', { default: { frames: [0], rate: 1 }});
	//Q.stageScene('mainLevel');

	Q.stageScene('startGame');
});

Q.scene('startGame', function(stage, dt) {
	stage.insert(new Q.Sprite({ asset: 'background2.jpg', x: Q.el.width / 2, y: Q.el.height / 2, type: Q.SPRITE_NONE }));

	var container = stage.insert(new Q.UI.Container({
		x: Q.width /2, y: Q.height /2, fill: '#FFFFFF'
	}));

	var button = container.insert(new Q.UI.Button({
		x: 0, y: 0, fill: '#CCCCCC', label: 'Start Game'
	}));

	container.insert(new Q.UI.Text({
		x: 10, y: -10 - button.p.h, fill: '#FFFFFF', label: 'Try to stay alive!', align: 'center'
	}));

	button.on('click', function() {
		Q.pauseGame();
		//Q.clearStages();
		Q.stageScene('mainLevel');
	});

	setTimeout(function() {
		Q.gameLoop(function(dt) {
		    Q.pauseGame();
		});
	}, 500);

	container.fit(20);
});
/*
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
} */