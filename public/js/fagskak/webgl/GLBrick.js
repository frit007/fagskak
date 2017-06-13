
if (typeof require !== 'undefined') {
    require(Brick)
}



var GLBrick = GLBrick || function(){
	var GLBrick = function(x, z, scene) {
		this.scene = scene;

		// window
		this.x = x;
		this.z = z;


		// create new arrays so they are not shared across bricks 
		this.meshes= [];
		this.boundFigures = [];

		this._fillHeight();


	}
	
	function extend(extended, extendFrom, prototype) {
		var proto = Object.create(extendFrom);

		for(var key in prototype) {
			proto[key] = prototype[key];
		}

		extended.prototype = proto	
	}

	extend(GLBrick, Brick.prototype, {

	});

	return GLBrick;
}()


// UMD (Universal Module Definition)
;(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return GLBrick;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {
	
		// Node.js
		module.exports = GLBrick;
	
	} else if (typeof root !== 'undefined') {
	
		// Global variable
		root.GLBrick = GLBrick;
	
	}

})(this);