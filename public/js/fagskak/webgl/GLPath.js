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

var GLPath = function(bricks, scene) {
	this.bricks = [];
    this.scene = scene;

}

GLPath.prototype = {
	update: function() {
		this.particleGeometry = new THREE.Geometry();
		for (var i = 0; i < 100; i++)
			this.particleGeometry.vertices.push( new THREE.Vector3(0,0,0) );

		this.attributes = 
		{
			customColor:	 { type: 'c',  value: [] },
			customOffset:	 { type: 'f',  value: [] },
		};

		var particleCount = this.particleGeometry.vertices.length
		for( var v = 0; v < particleCount; v++ ) 
		{
			this.attributes.customColor.value[ v ] = new THREE.Color().setHSL( 1 - v / particleCount, 1.0, 0.5 );
			this.attributes.customOffset.value[ v ] = 6.282 * (v / particleCount); // not really used in shaders, move elsewhere
		}

		// values that are constant for all particles during a draw call
		this.uniforms = 
		{
			time:      { type: "f", value: 1.0 },
			texture:   { type: "t", value: discTexture },
		};

		this.shaderMaterial = new THREE.ShaderMaterial( 
		{
			uniforms: 		this.uniforms,
			attributes:     this.attributes,
			vertexShader:   vertexShader,
			fragmentShader: fragmentShader,
			transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
			// blending: THREE.AdditiveBlending, depthTest: false,
			// I guess you don't need to do a depth test if you are alpha blending
			// 
		});

		this.particleCube = new THREE.ParticleSystem( this.particleGeometry, this.shaderMaterial );
		this.particleCube.position.set(0, 85, 0);
		this.particleCube.dynamic = true;
		// in order for transparency to work correctly, we need sortParticles = true.
		//  but this won't work if we calculate positions in vertex shader,
		//  so positions need to be calculated in the update function,
		//  and set in the geometry.vertices array
		this.particleCube.sortParticles = true;
		this.scene.add( this.particleCube );
	},
	addBricks: function(bricks) {

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