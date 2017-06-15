
if (typeof require !== 'undefined') {
    TWEEN = require("../tween/Tween.js");
}

var Brick = Brick || (function() {
    var Brick = function(x, z, scene, board) {
        this.board = board;
        this.scene = scene;

		// window
		this.x = x;
		this.z = z;


		// create new arrays so they are not shared across bricks 
		this.meshes= [];
		this.boundFigures = [];

		this._fillHeight();
    }

    Brick.prototype = {
		y: 1,
		height: 1,
		lastY:1,
		yChangeBegin: null,
		yAnimationDuration:500,
        moveAnimation: null,
		// meshes
		meshes: [],
		// update Figure Z automatically
		boundFigures: [],
		// Box_material: new THREE.MeshPhongMaterial( {
		// 	color: 0xff0000,
		// 	shininess: 150,
		// 	specular: 0x222222,
		// 	shading: THREE.SmoothShading,
		// } ),
		// used to create meshes equivalent to the height
		_fillHeight: function(){
			while(this.meshes.length < this.height) {
				var brick_geometry = new THREE.BoxGeometry( this.board.boardDim.brickDim.x,this.board.boardDim.brickDim.y,this.board.boardDim.brickDim.z );
				var brickMaterial;
				if ((this.z+this.x+this.meshes.length)%2===1) {
					// brickMaterial = white_brick_material;
					// materials are created each time so we are able to change them individually later, this might not be necessary
					brickMaterial = new THREE.MeshPhongMaterial( {
						color: 0xdbdbdb,
						shininess: 5,
						shading: THREE.SmoothShading,
					} );
				} else {
					// brickMaterial = black_brick_material;
					brickMaterial = new THREE.MeshPhongMaterial( {
						color: 0x161616,
						shininess: 5,
						shading: THREE.SmoothShading,
					} );
				}
				var mesh = new THREE.Mesh( brick_geometry, brickMaterial );
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				// console.log("create board object ", this.x,this.z);
				this.board.brickObjects.push(mesh);
				this.scene.add(mesh);
				this.meshes.push(mesh);
				mesh.brick = this;
				
				// this.mesh.position.set(x*this.board.boardDim.brickDim.x,1*this.board.boardDim.brickDim.y,z*this.board.boardDim.brickDim.z);

				// mesh.position.copy(translatedTHREEPosition(this.x,2 - this.meshes.length,this.z));
				this.drawMeshes();
			}

		},
		increaseHeight: function(newHeight) {
			if (newHeight > this.y) {
                var startY = this.y;
				this.height = newHeight;
				this._fillHeight();
				this.y = newHeight;
				// this.yChangeBegin = this.board.getTime();
				// addWaitForNextFrame(this._updateY.bind(this));

                this.startIncreaseHeightAnimation(startY, this.y);


				return true;
			} else {
				return false;
			}
		},
        startIncreaseHeightAnimation: function(fromY, toY) {
            console.log("!!!!!!!!!!!!!!!!!!");
            var brick = this;
                if (this.board.useAnimations) {
                    if (this.moveAnimation !== null) {
                        this.moveAnimation.stop();
                    }
                    topMeshPosition = this.meshes[0].position;
				    this.lastY = this.y;
                    this.moveAnimation = new TWEEN.Tween(topMeshPosition)
                    .to(this.board.translatedTHREEPosition(topMeshPosition.x,toY,topMeshPosition.z),750)
                    .onUpdate(function(args) {


                        // var timeSinceStart = currentTime - this.yChangeBegin;

                        // var animationProgress = timeSinceStart / this.yAnimationDuration;
                        // if (animationProgress > 1) {
                        // 	animationProgress = 1;
                        // } else {
                        // 	addWaitForNextFrame(this.updateY.bind(this));
                        // }
                        var position = brick.board.reveseTranslatedTHREEPosition(brick.meshes[0].position);

                        // var animationProgress = brick.getAnimationProgressAtTime(currentTime)

                        // if (animationProgress < 1) {
                        //     addWaitForNextFrame(this._updateY.bind(this));
                        // }

                        // var height = this.getHeightAtTime(currentTime, animationProgress);
                        // this.mesh.position.y = height * this.board.boardDim.brickDim.y;


                        console.log("Y:", position.y);
                        brick.drawMeshes(position.y);
                    })
                    .onComplete(function() {
                        // console.log("DONE!!!!");
                        brick.moveAnimation = null;
                    })
                    .start()
                }
        },
		getAnimationProgressAtTime: function(time) {

			var timeSinceStart = time - this.yChangeBegin;

			var animationProgress = timeSinceStart / this.yAnimationDuration;
			if (animationProgress > 1) {
				animationProgress = 1;
			}
			return animationProgress;
		},
		bindFigure: function(figure) {
			this.boundFigures.push(figure);
		},
		unBindFigure: function(figure) {

			var index = this.boundFigures.indexOf(figure);
			if (index > -1) {
				this.boundFigures.splice(index, 1);
			}

		},
		drawMeshes: function(y) {
			y = y || this.y
			for (var i = this.meshes.length - 1; i >= 0; i--) {
				// this.meshes[i].position.y = (y-i) * this.board.boardDim.brickDim.y;
				console.log(i,y,(y-i));
				this.meshes[i].position.copy( this.board.translatedTHREEPosition(this.x, (y-i), this.z));
			}
            // draw figures standing on top of this field
            for (var i = 0; i < this.boundFigures.length; i++) {
                var figure = this.boundFigures[i];
                figure.setY(y+1);
            }
		},
		getMeshes: function() {
			return this.meshes;
		},
		getHeightAtTime: function(time, animationProgress) {
			animationProgress = animationProgress || this.getAnimationProgressAtTime(time);

			var differenceInY = this.y - this.lastY;
			var currentY = this.lastY + (differenceInY*animationProgress);
			return currentY;
		}
    }

    return Brick;
}());



// UMD (Universal Module Definition)
(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return Brick;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Brick;
    
    } else if (root !== undefined) {
    
        // Global variable
        root.Brick = Brick;
    
    }

})(this);