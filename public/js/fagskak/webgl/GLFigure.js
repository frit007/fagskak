

var GLFigure = GLFigure || (function() {
    console.log(Figure.prototype);
    function GLFigure(x, y, z, board, meshPath, scene) {
        Figure.apply(this,arguments);

        this.scene = scene;
        this.loadMesh(scene, meshPath, function(mesh) {
            // mesh.position.set(12,5,12);
            this.mesh = mesh;
            // window.board = board;
            var brick = this.board.getBrick(x,z);
            console.log("bricks",this.board, brick);
            this.updatePosition()

            var shadedMaterial = new THREE.MeshPhongMaterial( {
                color: this.color,
                shininess: 5,
                shading: THREE.SmoothShading,
            });

            mesh.material = shadedMaterial;

            brick.bindFigure(this);
            console.log(brick);
        }.bind(this));
    }

    GLFigure.prototype = Object.create(Figure.prototype);
    GLFigure.prototype.constructor = GLFigure;

    Object.assign(GLFigure.prototype, {
        color: "#6495ED",
        // store the TWEEN animation
        tweenAnimation: undefined,
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
			},
            function(data){
                console.log("progress", data);
            },
            function(data) {
                console.log("error" ,data);
            });
		},
        moveAnimation: function(relativeX, relativeY, relativeZ, brick, callback) {
            this.tweenAnimation = new TWEEN.Tween(this.mesh.position)
            .to(this.focusedPosition(relativeX,relativeY,relativeZ),750)
            .onComplete(function() {
                brick.bindFigure(this)
                // console.log("DONE!!!!");
                this.tweenAnimation = null;
                callback();
            }.bind(this))
            .start()
        },
        setColor: function(color) {
                this.color = color;
            if (this.mesh) {
                this.mesh.color = new THREE.Color(color)            
            } else {
                // console.error("figure does not have mesh", this);
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
    });

    return GLFigure;
})();
