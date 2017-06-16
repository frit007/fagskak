
if (typeof require !== 'undefined') {
    this.Brick = require('../public/js/Brick');
    this.Figure = require('../public/js/Figure');
}

var Board = Board || function(){


    /**
     * The Board defines the 
     * 
     */
    var Board = function() {
        // var board = this;
        // setTimeout(function(){
        // },0)
        
        this.boardInitialize.apply(this,arguments)
        
    }

    Board.prototype = {
        useAnimations: false,
        boardInitialize: function() {
            console.log(arguments);
			this.glScene = new THREE.Scene();
            this.brickObjects = [];
            this.bricks = []; // board is access by using the x axis first then the z axis

            this.createBricks(this.glScene)

            // window.main = new Figure(5, 2, 5, 'example_three_figure', this.glScene, this);
            
        },
        raycaster: new THREE.Raycaster(),
        getTime: function() {
			// return new Date().getTime();
			return TWEEN.now();
		},
        loadMesh: function(scene, meshName, meshLoaded) {
			var locationName = '/gl_objects/' + meshName + '.json';
			console.log(locationName);
			var loader = new THREE.JSONLoader();
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
        getBrick: function(x,z) {


            // console.log("this bricks", this.bricks);
			var bricksX = this.bricks[x];
			if (bricksX !== undefined) {
				var brick = bricksX[z];
				if (brick !== undefined) {
					return brick;
				}
			}
			return null;
		},
        createBricks: function(scene) {

            // create bricks
            for (var x = this.boardDim.width-1; x >= 0; x--) {
                this.bricks[x] = [];
                for (var z = this.boardDim.height - 1; z >= 0; z--) {
                    this.bricks[x][z] = null;
                }
            }

            // assign board dim to a local variable to avoid writing this all the time
            var boardDim = this.boardDim;
			
            for (var x = boardDim.width-1; x >= 0; x--) {
				for (var z = boardDim.height-1; z >= 0; z--) {
					var cornerRadius = 4;
					
					// this part checks if something is a corner by checking if the it is 4 squares away from the edge. 
					// if it is 4 squares away form 2 edges then it is an corner and should be removed
					var corners = 0;
					corners += z < cornerRadius;
					corners += x < cornerRadius;
					corners += x >= boardDim.width -cornerRadius;
					corners += z >= boardDim.height -cornerRadius;

					var antiCorners = 0; 
					// because the there is a piece of the corners that is not supposed to be used as a corner 
					antiCorners += x == cornerRadius-1;
					antiCorners += z == cornerRadius-1;
					antiCorners += x == boardDim.width - cornerRadius;
					antiCorners += z == boardDim.height - cornerRadius;

					if (corners == 2 // check if the brick is in a corner
						&& antiCorners != 2 // check if the brick is not supposed to be removed 
						) {
						// just skip the creation of the brick if it is in a corner
						continue;
					}

					var brick = new Brick(x, z, scene, this);

					this.bricks[x][z] = brick;
				}
			}
		},
        translatedTHREEPosition: function(x,y,z) {
            var vector = new THREE.Vector3(
                x*this.boardDim.brickDim.x,
                y*this.boardDim.brickDim.y,
                z*this.boardDim.brickDim.z
                );
            // console.log(vector)
            return vector;
        },
        reveseTranslatedTHREEPosition: function(vector) {
            var vector = new THREE.Vector3(
                vector.x/this.boardDim.brickDim.x,
                vector.y/this.boardDim.brickDim.y,
                vector.z/this.boardDim.brickDim.z
                );
            // console.log(vector)
            return vector;
        },
        boardDim: {
            width: 18,
            height: 18,
            brickDim: {
                x:3,
                y:3,
                z:3
            }
        },
        init: function() {
			glScene = new THREE.Scene();
            
        },
        
    }

    return Board;
    

}();


// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return Board;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Board;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Board = Board;
    
    }

})(this);