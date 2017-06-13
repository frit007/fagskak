
var Figure = Figure || function() {
    var Figure = function(x,y,z,meshPath,scene,board) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
        this.board = board;
        this.loadMesh(scene, meshPath, function(mesh) {
            // mesh.position.set(12,5,12);
            this.mesh = mesh;
            window.board = board;
            var brick = this.board.getBrick(x,z);
            console.log("bricks",this.board, brick);
            this.updatePosition()
            brick.bindFigure(this);
            console.log(brick);
        }.bind(this));
    }

    Figure.prototype = {
        loadMesh: function(scene, meshName, meshLoaded) {
			var locationName = '/gl_objects/' + meshName + '.json';
			console.log(locationName);
			var loader = new THREE.JSONLoader();
			console.log("HEO");
			loader.load(locationName, function(geometry) {
				console.log("geo",geometry);
				mesh = new THREE.Mesh(geometry);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				//boardObjects.push(mesh)
				scene.add(mesh);
				meshLoaded(mesh);
			});
		},
        // define it so it can be overwritten
        moveAnimation: undefined,

        goto: function(x, y, z) {
            
            // unbind brick so it no longer will be pushed up automatically if the brick moves
            var brick = this.board.getBrick(this.x,this.z);
            brick.unBindFigure(this);
            
            // for (var i = distance; i >= 0; i--) {
            // 	var relativeX = moveX * i + this.x;
            // 	var relativeY = moveY * i + this.y;
            // 	var relativeZ = moveZ * i + this.z;


            // 	brick = getBrick(relativeX,relativeZ);
            // 	if (brick) {
            // 		brick.changeY(relativeY-1);
            // 		console.log(brick,relativeY);
            // 	}
            // }

            var relativeX = x + this.x;
            var relativeY = y + this.y;
            var relativeZ = z + this.z;
            var brick = this.board.getBrick(relativeX,relativeZ);
            window.moveToBrick = brick;
            console.log()
            brick.increaseHeight(relativeY-1);
            // brick.bindFigure(this);
            this.x=relativeX;
            this.z=relativeZ;
            this.y=relativeY;

            if (this.board.useAnimations) {
                this.moveAnimation = new TWEEN.Tween(this.mesh.position)
                .to(this.focusedPosition(relativeX,relativeY,relativeZ),750)
                .onComplete(function() {
                    brick.bindFigure(this)
                    // console.log("DONE!!!!");
                    this.moveAnimation = null;
                }.bind(this))
                .start()
            }
        },
        setY: function(y) {
            console.log(y);
            this.y = y;
            this.updatePosition();
        },
        focusedPosition: function(x,y,z) {
            return this.board.translatedTHREEPosition(x,y-0.4,z);
        },
        updatePosition: function() {
            var vec = this.focusedPosition(this.x,this.y,this.z);
            console.log(vec);
            this.mesh.position.copy(vec);
        },
    }
    return Figure;
}();

// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return Figure;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Figure;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Figure = Figure;
    
    }

})(this);