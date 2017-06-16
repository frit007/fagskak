var vertexShader = "uniform float time;\n"+
"attribute vec3 customColor;\n"+
"varying vec3 vColor;\n"+
"void main() \n"+
"{\n"+
	"vColor = customColor; // set color associated to vertex; use later in fragment shader.\n"+
"\n"+
	"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n"+
"\n"+
	"// option (1): draw particles at constant size on screen\n"+
	"// gl_PointSize = size;\n"+
    "// option (2): scale particles as objects in 3D space\n"+
	"gl_PointSize = 40.0 * ( 300.0 / length( mvPosition.xyz ) );\n"+
	"gl_Position = projectionMatrix * mvPosition;\n"+
"}";

var fragmentShader =
"uniform sampler2D texture;\n"+
"varying vec3 vColor; // colors associated to vertices, assigned by vertex shader\n"+
"void main() \n"+
"{\n"+
	"// calculates a color for the particle\n"+
	"gl_FragColor = vec4( vColor, 1.0 );\n"+
	"// sets a white particle texture to desired color\n"+
	"gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n"+
"}"



var discTexture = THREE.ImageUtils.loadTexture( 'images/disc.png' );

var GLPath = function(board, color) {
	this.bricks = [];
    this.scene = board.glScene;
	this.board = board;

	this.particles = new THREE.Geometry();

	for (var p = 0; p < this.particleCount; p++) {
		
		// Create the vertex
		var particle = new THREE.Vector3(this.startPlace, this.startPlace, this.startPlace);
		
		// Add the vertex to the geometry
		this.particles.vertices.push(particle);
	}
	var color = color || 0x414cf4;

	this.particleMaterial = new THREE.PointsMaterial({
		color: color, 
		size: 2,
		map: THREE.ImageUtils.loadTexture("images/spark.png"),
		// blending: THREE.AdditiveBlending,
		// blending: THREE.NoBlending,
		transparent: true,
	});
	
	this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);

	this.scene.add(this.particleSystem);

}

GLPath.prototype = {
	levitate: 3,
	// used to indicate how many total particles there are(the max theoretical)
	particleCount: 1500,
	particleIndex: 0,
	startPlace: 99999999999,

	resetParticles: function() {
		for (var p = 0; p < this.particleIndex; p++) {
			// a place far offscreen, since it is easier than actually deleting them
			
			// debugger;
			var particle = this.particles.vertices[p];
			particle.x = this.startPlace;
			particle.z = this.startPlace;
			particle.y = this.startPlace;
		}
		// debugger;
		// selector.path.particles.rotateX(0)

		// this.particles.verticesNeedUpdate = true;
		// this.particles.normalsNeedUpdate = true;
		// so in thory you should be able to call normalsNeedUpdate then they would update but since that is not the case we call rotateX.(that somehow fixes it)
		// this.particles.rotateX(0);
		this.forceUpdate();
	},
	forceUpdate: function() {
		this.particles.verticesNeedUpdate = true;
		this.particles.normalsNeedUpdate = true;
		this.particles.computeBoundingSphere();
		this.particles.computeFaceNormals();
		this.particles.computeVertexNormals();
		// selector.path.particles.rotateX(0)

		// eval("selector.path.particles.rotateX(0)")
	},
	hide: function() {
		this.particleSystem.visible = false;
	},
	show: function() {
		this.particleSystem.visible = true;
	},

	update: function(bricks, force) {
		// debugger;

		if (!force && this.bricks.length === bricks.length) {
			// this is probably going to produce a bug or two, but if the wasn't a change in how many bricks there have been then do not do anything
			return;
		}
		this.resetParticles();

		this.bricks = bricks;

		// create a map of what bricks are occupied
		var brickMap = []
		for (var x = 0; x < this.board.boardDim.width; x++) {
			brickMap[x] = [];
			for (var y = 0; y < this.board.boardDim.height; y++) {
				brickMap[x][y] = false;
			}
		}

		for (var index = bricks.length-1; index >= 0; index--) {
			var brick = bricks[index];
			// debugger;
			if (brick) {
				brickMap[brick.x][brick.z] = true;			
			} else {
				bricks.splice(index,1);
			}
		}

		if (bricks.length === 0) {
			return;
		}

		this.particleIndex = 0;
		// var brickY = bricks[0].meshes[0].position.y;
		var brickY = this.board.getYPosition();
		var width = this.board.boardDim.brickDim.x;
		var height = this.board.boardDim.brickDim.z;
		var placeParticle = (x, z) => {
			var particle = this.particles.vertices[this.particleIndex];
			// debugger;
			particle.x = x * width;
			particle.y = brickY + this.levitate;
			particle.z = z * height;

			this.particleIndex++;
		}
		
		
		for (var index = 0; index < bricks.length; index++) {
			var brick = bricks[index];
			// debugger;
			if (!(brick.x - 1 != -1 && brickMap[brick.x-1][brick.z] === true)) {
				placeParticle(brick.x - 0.35, brick.z + 0.25);
				placeParticle(brick.x - 0.35, brick.z - 0.25);
			}
			if (!(brick.x + 1 != 18 && brickMap[brick.x+1][brick.z] === true)) {
				placeParticle(brick.x + 0.35, brick.z + 0.25);
				placeParticle(brick.x + 0.35, brick.z - 0.25);
			}
			if (!(brick.y - 1 != -1 && brickMap[brick.x][brick.z -1] === true)) {
				placeParticle(brick.x - 0.25, brick.z - 0.35);
				placeParticle(brick.x + 0.25, brick.z - 0.35);
			}
			if (!(brick.y + 1 != 18 && brickMap[brick.x][brick.z +1] === true)) {
				placeParticle(brick.x - 0.25, brick.z + 0.35);
				placeParticle(brick.x + 0.25, brick.z + 0.35);
			}
			

		}
		this.forceUpdate();

		// this.particleGeometry = new THREE.Geometry();
		// for (var i = 0; i < 100; i++)
		// 	this.particleGeometry.vertices.push( new THREE.Vector3(0,0,0) );

		// this.attributes = 
		// {
		// 	customColor:	 { type: 'c',  value: [] },
		// 	customOffset:	 { type: 'f',  value: [] },
		// };

		// var particleCount = this.particleGeometry.vertices.length
		// for( var v = 0; v < particleCount; v++ ) 
		// {
		// 	this.attributes.customColor.value[ v ] = new THREE.Color().setHSL( 1 - v / particleCount, 1.0, 0.5 );
		// 	this.attributes.customOffset.value[ v ] = 6.282 * (v / particleCount); // not really used in shaders, move elsewhere
		// }

		// // values that are constant for all particles during a draw call
		// this.uniforms = 
		// {
		// 	time:      { type: "f", value: 1.0 },
		// 	texture:   { type: "t", value: discTexture },
		// };

		// this.shaderMaterial = new THREE.ShaderMaterial( 
		// {
		// 	uniforms: 		this.uniforms,
		// 	attributes:     this.attributes,
		// 	vertexShader:   vertexShader,
		// 	fragmentShader: fragmentShader,
		// 	transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
		// 	// blending: THREE.AdditiveBlending, depthTest: false,
		// 	// I guess you don't need to do a depth test if you are alpha blending
		// 	// 
		// });

		// this.particleCube = new THREE.ParticleSystem( this.particleGeometry, this.shaderMaterial );
		// this.particleCube.position.set(0, 85, 0);
		// this.particleCube.dynamic = true;
		// // in order for transparency to work correctly, we need sortParticles = true.
		// //  but this won't work if we calculate positions in vertex shader,
		// //  so positions need to be calculated in the update function,
		// //  and set in the geometry.vertices array
		// this.particleCube.sortParticles = true;
		// this.scene.add( this.particleCube );

	},
	addBricks: function(bricks) {
		// var originalCount = 
		for (var index = 0; index < bricks.length; index++) {
			var brick = bricks[index];
			if (this.bricks.indexOf(brick) === -1) {
				bricks
			}
		}
	},
	removeBricks: function(bricks) {

	}

}


// UMD (Universal Module Definition)
;(function (root) {

	if (typeof define === 'function' && define.amd) {

		// Asynchronous Module Definition(AMD)
		define([], function () {
			return GLPath;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {
	
		// Node.js
		module.exports = GLPath;
	
	} else if (typeof root !== 'undefined') {
	
		// Global variable
		root.GLPath = GLPath;
	
	}

})(this);