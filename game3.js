/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function() {
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	this.Class = function() {
	};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for ( var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function"
					&& typeof _super[name] == "function"
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() {
			this.guid = guid();
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();

function guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

var canvas,context;

var gamely = {
	CONTROL_TYPE : {
		HUMAN : 1,
		COMPUTER : 2
	}
};

var Actor = Class.extend({
	init : function(x, y, visible, color, controlType, canMove) {
		this.x = x;
		this.y = y;
		this.controlType = controlType;
		this.canMove = canMove;
		this.visible = visible;
		this.color = color;
		this.active = true;
		
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.moveNE=false;
		this.moveSE=false;
		this.moveNW=false;
		this.moveSW=false;
		
		this.height = 0;
		this.width = 0;
		this.angle = 0;
		this.speed = 0;
		this.energy=0;
		this.actorClass = "actor";
	},

	show : function() {
		this.visible = true;
	},

	hide : function() {
		this.visible = false;
	},

	kill : function() {
		this.active = false;
		this.hide();
		
	},

	drawFunction : function() {
		// Do nothing
	},

	draw : function() {
		if (this.visible && this.active)
			this.drawFunction();
	},

	move : function(x, y) {
		if (this.canMove) {
			this.x = x;
			this.y = y;
		}
	},
	enableControls : function(moveLeft, moveRight, moveUp, moveDown,moveNE,moveSE,moveSW,moveNW) {
		if (this.canMove && this.controlType == gamely.CONTROL_TYPE.HUMAN) {
			this.moveLeft = moveLeft;
			this.moveRight = moveRight;
			this.moveUp = moveUp;
			this.moveDown = moveDown;
			this.moveNE = moveNE;
			this.moveSE = moveSE;
			this.moveSW = moveSW;
			this.moveNW = moveNW;
		}
	},
	manualMove : function(direction) {
		switch (direction) {
		case "NE":
			if((this.moveNE)&&((this.x+this.radius<gameBoard.boardWidth)&&(this.y-this.radius>0)))
				this.move(this.x +2.5 , this.y-2.5);
			break;
		case "SE":
			if ((this.moveSE)&&((this.x+this.radius<gameBoard.boardWidth)&&(this.y+this.radius<gameBoard.boardHeight)))
				this.move(this.x +2.5 , this.y+2.5);
			break;
		case "SW":
			if ((this.moveSW)&&((this.x-this.radius>0)&&(this.y+this.radius<gameBoard.boardHeight)))
				this.move(this.x -2.5 , this.y+2.5);
			break;
		case "NW":
			if ((this.moveNW)&&((this.x-this.radius)&&(this.y-this.radius>0)))
				this.move(this.x -2.5 , this.y-2.5);
			break;
		case "left":
			if ((this.moveLeft) && (this.x-this.radius > 0))
				this.move(this.x - 5, this.y);
			break;
		case "right":
			if ((this.moveRight) && (this.x + this.radius < gameBoard.boardWidth))
				this.move(this.x + 5, this.y);
			break;
		case "up":
			if ((this.moveUp) && (this.y-this.radius > 0))
				this.move(this.x, this.y - 5);
			break;
		case "down":
			if ((this.moveDown) && (this.y + this.radius < gameBoard.boardHeight))
				this.move(this.x, this.y+5);
			break;
		default:
			break;
		}
	},
	act:function(){
		
	}

});

var CircleActor = Actor.extend({
	init : function(x, y, radius, visible, color, controlType,
			canMove) {
		this._super(x, y, visible, color, controlType,
				canMove);
		this.radius = radius;
		this.bounceOnLeftWall=false;
		this.bounceOnRightWall=false;
		this.bounceOnTopWall=false;
		this.bounceOnBottomWall=false;
		
		this.shape='circle';
		
	},
	drawFunction : function() {
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	},

	act : function() {

		var radians = this.angle * Math.PI / 180;
		var xunits = Math.cos(radians) * this.speed;
		var yunits = Math.sin(radians) * this.speed;
		this.hitWalls();
		//this.collidesWith(gameBoard.actors);
		this.move(this.x + xunits, this.y + yunits);

	},
	hitWalls: function(){
		//left side wall
		if((this.x - this.radius < 0)&&	(this.bounceOnLeftWall))
 
		{
			this.bounce('left');
		}
		//right side wall
		else if((this.x + this.radius > gameBoard.boardWidth)&&(this.bounceOnRightWall))
		{
			this.bounce('right');	
		}
		//top wall
		if((this.y - this.radius <= 0.0)&&(this.bounceOnTopWall))
		{
			this.bounce('top');
		}
		//bottom wall
		else if((this.y + this.radius >= gameBoard.boardHeight)&&(this.bounceOnBottomWall))
		{
			this.bounce('bottom');
		}
	},

	bounce : function(side) {
		switch(side){
		case "left":
			if (this.angle > 90 && this.angle < 180)
				this.angle = this.angle - 90;

			if (this.angle < 270 && this.angle > 180)
				this.angle = this.angle + 90;
			break;

		case "right":
			if (this.angle > 270)
				this.angle = this.angle - 90;

			if (this.angle < 90)
				this.angle = this.angle + 90;
			break;

		case "top":
			if(this.angle > 180)	
				this.angle = 360 - this.angle;
			break;

		case "bottom":
			if(this.angle < 180)
				this.angle = 360 - this.angle;
			break;
		}

	}
	
});
var RectActor = Actor.extend({
	init : function( x, y, height, width, visible, color, controlType,
			canMove) {
		this._super( x, y, visible, color, controlType, canMove);
		this.height = height;
		this.width = width;
		this.shape='rectangle';
	},

	drawFunction : function() {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.strokeRect(this.x, this.y, this.width, this.height);
	}

});
var gameBoard = {
	actors : actors = new Array,
	boardHeight: boardHeight = 500,
	boardWidth: boardWidth = 500,
	clean : function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	},
	draw : function() {
		context.strokeStyle='black';
		context.strokeRect(0,0,this.boardWidth,this.boardHeight);
		for ( var i in actors) {
			actors[i].draw();
		}
	},
	redraw : function() {
		gameBoard.clean();
		gameBoard.draw();
	},
	addActor : function(actor) {
		actors.push(actor);
	},
	isGameOver: function(actor){
		if(actor.x>this.boardWidth||actor.y>this.boardHeight)
		{
			return true;
		}
		else return false;
	},
	drawGameOver: function(){
		context.fillText("Game Over!!",this.boardWidth/2,this.boardHeight/2);
	},
	hitCircle:function(round1,round2){
		{
			var distx=round2.x-round1.x;
			var disty=round2.y-round1.y;
			var centerDistance=Math.sqrt(distx*distx+disty*disty);
			if(centerDistance<=round1.radius+round2.radius)
			{
				return true;
			}

		}
	},
	collisions:function(){
		var r1,r2;
		for(var i=0;i<this.actors.length;i++)
		{
			r1=this.actors[i];
			if(r1.visible)
			{
				for(var j=0;j<i;j++)
				{
					r2=this.actors[j];
					if(r2.visible)
					{
						if(this.hitCircle(r1,r2))
						{
							if(r1.energy<r2.energy)
							{
								r1.kill();
								r2.energy+=r1.energy;
							}
							else
							{
								r2.kill();
								r1.energy+=r2.energy;
							}
						}
					}
				}
			}
		}
	}
};

var direction=null;
var moveLeft,moveRight,moveUp,moveDown,moveNE,moveSE,moveSW,moveNW;

var numberOfBalls=20;
var maxRadius=20;
var minRadius=8;
var maxSpeed=maxRadius+5;
var maxEnergy=100;

function initialScreen() {
	canvas= document.getElementById("ballBounce");
	context=canvas.getContext("2d");

	var playerBall=new CircleActor(100, 100, 15, true,'yellow' ,1,true);
	playerBall.energy=80;
	playerBall.actorClass='ball';
	gameBoard.addActor(playerBall);
	
	for(var i=0;i<numberOfBalls;i++)
	{
		var tempRadius=Math.floor(Math.random()*maxRadius)+minRadius;
		var tempX=Math.floor(Math.random()*gameBoard.boardWidth);
		var tempY=Math.floor(Math.random()*gameBoard.boardHeight);
		var tempSpeed=maxSpeed-tempRadius;
		var tempEnergy=Math.floor(Math.random()*maxEnergy);
		var	tempAngle = Math.floor(Math.random()*360);
		var color;
		if(playerBall.energy<tempEnergy){
			 color="red";
		}
		else color="green";
		var enemyBall=new CircleActor(tempX,tempY,tempRadius,true,color,2,true);
		enemyBall.energy=tempEnergy;
		enemyBall.angle=tempAngle;
		enemyBall.speed=tempSpeed;

		enemyBall.bounceOnLeftWall=true;
		enemyBall.bounceOnRightWall=true;
		enemyBall.bounceOnTopWall=true;
		enemyBall.bounceOnBottomWall=true;

		enemyBall.actorClass = "ball";
		
		gameBoard.addActor(enemyBall);
	}
	
	gameBoard.draw();

	setInterval(function(){
		for(i in gameBoard.actors)
		{
			gameBoard.actors[i].act();
		}
		
		playerBall.enableControls(moveLeft, moveRight, moveUp, moveDown,moveNE,moveSE,moveSW,moveNW);
		playerBall.manualMove(direction);

		gameBoard.collisions();
		gameBoard.redraw();

	},30);

}


//event handler for key press
function onKeyDown(event) {

	if (event.keyCode == 33) {
		moveNE = true;
		direction = "NE";
	} else if (event.keyCode == 34) {
		moveSE = true;
		direction = "SE";
	} else if (event.keyCode == 35) {
		moveSW = true;
		direction = "SW";
	}else if (event.keyCode == 36) {
		moveNW = true;
		direction = "NW";
	}else if (event.keyCode == 37) {
		moveLeft = true;
		direction = "left";
	}else if (event.keyCode == 38) {
		moveUp = true;
		direction = "up";
	}else if (event.keyCode == 39) {
		moveRight = true;
		direction = "right";
	}else if (event.keyCode == 40) {
		moveDown = true;
		direction = "down";
	}
}

// event handler for key release
function onKeyUp(event) {
	if (event.keyCode == 33) {
		moveNE = false;
	} else if (event.keyCode == 34) {
		moveSE = false;
	} else if (event.keyCode == 35) {
		moveSW = false;
	}else if (event.keyCode == 36) {
		moveNW = false;
	}else if (event.keyCode == 37) {
		moveLeft = false;
	}else if (event.keyCode == 38) {
		moveUp = false;
	}else if (event.keyCode == 39) {
		moveRight = false;
	}else if (event.keyCode ==40){
		moveDown = false;
	}
}
