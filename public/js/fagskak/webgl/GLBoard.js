
if (typeof require !== "undefined") {
	this.Board = require('./public/js/Figure');

    this.Brick = require('../public/js/Brick');
    this.Figure = require('../public/js/Figure');
}

var GLBoard = GLBoard || function(exports){

	var GLBoard = function() {
		this.boardInitialize.apply(this, arguments)
		this.glBoardInitialize.apply(this, arguments);
	}

	
	function extend(extended, extendFrom, prototype) {
		var proto = Object.create(extendFrom);

		for(var key in prototype) {
			proto[key] = prototype[key];
		}

		extended.prototype = proto	
	}

	extend(GLBoard, Board.prototype, {
        useAnimations: true,
		running: true,
		glBoardInitialize: function(args) {
			var args = args || {};
			this.container = args.container;
			this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, .1, 500);
			this.glRenderer = this.createGlRenderer();
			this.cssScene = new THREE.Scene();
			this.mouse = new THREE.Vector2();
			this.spotLight;
			this.SCREEN_HEIGHT;
			this.SCREEN_WIDTH;
			this.cssRenderer = this.createCssRenderer();
			this.waitForNextFrame = [];

			$(window).resize(function(){
				this.SCREEN_WIDTH = window.innerWidth;
				this.SCREEN_HEIGHT = window.innerHeight;
				this.camera.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
				this.camera.updateProjectionMatrix();
				this.glRenderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
				if (cssRenderer) {
					cssRenderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);				
				}
			});
			
			this.animate();

			this.loadCornerLabels(this.glScene);
			this.createLight(this.glScene);

			$(container).append(this.glRenderer.domElement);
			
			this.createControls();
		},
		createLight: function(scene) {
			var ambient = new THREE.AmbientLight( 0x404040,0.2 );
			scene.add( ambient );

			var light = new THREE.PointLight( 0xffffff, 4, 100 );
			light.position.set( 27, 50, 27 );
			light.castShadow = true;            // default false
			light.shadow.mapSize.width = 4048;  // default 512
			light.shadow.mapSize.height = 4048; // default 512
			light.shadow.camera.near = 2;       // default 0.5
			light.shadow.camera.far = 100;      // default 500
			//light.shadow.camera.left = 500    // Not sure about this one + 
																					// right, top and bottom, Do they still do anything?
			scene.add( light );
		},
		createControls: function() {
			var camera =  new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, .1, 500);

			// /*add controls*/
			var controls = new THREE.OrbitControls( camera, this.glRenderer.domElement );

			// disable pan
			controls.enablePan = false;

			controls.object.position.x=-2.7
			controls.object.position.z=27
			controls.object.position.y=52

			controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT }

			// controls.object.position.set(0, 100, 3000);

			controls.target = new THREE.Vector3( 22, 0, 27 );
			controls.update();

			this.container.addEventListener("mousedown",this.onMouseDown.bind(this),false);
			this.container.addEventListener('touchstart',this.onTouchStart.bind(this),false )
			
			this.controls = controls;
			this.camera = camera;
		},
		onMouseDown: function(event) {
			if (event.button === THREE.MOUSE.LEFT) {
				event.preventDefault();
				this.mouse.x = (event.clientX / this.glRenderer.domElement.width)*2 - 1;
				this.mouse.y = -(event.clientY / this.glRenderer.domElement.height)*2 + 1;

				// this.mouse.y = event.clientY;

				this.raycaster.setFromCamera(this.mouse, this.camera);

				var intersects = this.raycaster.intersectObjects(this.brickObjects);
				console.log(intersects);
				var color = Math.random() * 0xffffff;

				if (intersects.length > 0) {
					intersects[0].object.material.color.setHex(color);
					this.temp = intersects[0].object.material.color.getHexString();
					this.name = intersects[0].object.name;

					// console.log("!!!");
				}
			}
		},

		onTouchStart: function(event) {
			event.preventDefault();

			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
			onMouseDown(event);
		},
		runCustomAnimation: function(nowTime) {
			var delta = nowTime - this.lastTime;
			// take a copy waitForNextFrame, so we can clear it before 
			var copyOfWaitForNextFrame = this.waitForNextFrame;
			this.waitForNextFrame = [];
			
			for (var i = copyOfWaitForNextFrame.length - 1; i >= 0; i--) {
				// execute all logic that is waiting to be executed, pass the time that has passed and what time it is now
				copyOfWaitForNextFrame[i](delta, nowTime);
			}
		},
		animate: function() {
			// cube.rotation.x += 0.01;
			if (this.running) {
				requestAnimationFrame(this.animate.bind(this));			
			}
			var time = this.getTime();

			// run custom animation, might be replaced at some point
			this.runCustomAnimation(time);

			// use tween to avoid creating more cusom animations
			TWEEN.update(time);
			
			this.glRenderer.render(this.glScene, this.camera);
			this.cssRenderer.render(this.cssScene, this.camera);
		},
		loadCornerLabels: function(scene) {
			var loader = new THREE.FontLoader();
			loader.load( 'js/three/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {

				textGeometryProperties = {
					font: font,

					size: 5,
					height: 0.5,
					curveSegments: 0.1,

					bevelThickness: 0.1,
					bevelSize: 0.1,
					bevelEnabled: true
				}

				var textMaterial = new THREE.MeshPhongMaterial( 
					{ color: 0xff0000, specular: 0xffffff,shininess:10 }
				);


				// SV text
				var svGEO = new THREE.TextGeometry( "SV", textGeometryProperties);
				var sv = new THREE.Mesh( svGEO, textMaterial );
				sv.rotation.x=4.7
				sv.rotation.z=4.7
				sv.position.set(2-1.5, 3, 1-1.5)
				scene.add( sv );

				// NV text
				var nvGEO = new THREE.TextGeometry( "NV", textGeometryProperties);
				var nv = new THREE.Mesh( nvGEO, textMaterial );
				nv.rotation.x=4.7
				nv.rotation.z=4.7
				nv.position.set(47-1.5, 3, 1-1.5)
				scene.add( nv );

				// NE text
				var neGEO = new THREE.TextGeometry( "NE", textGeometryProperties);
				var ne = new THREE.Mesh( neGEO, textMaterial );
				ne.rotation.x=4.7
				ne.rotation.z=4.7
				ne.position.set(47-1.5, 3, 45-1.5)
				scene.add( ne );

				// se text
				var seGEO = new THREE.TextGeometry( "SE", textGeometryProperties);
				var se = new THREE.Mesh( seGEO, textMaterial );
				se.rotation.x=4.7
				se.rotation.z=4.7
				se.position.set(2-1.5, 3, 45-1.5)
				scene.add( se );

				// window.sv = sv;
			});  
		},
		createGlRenderer: function() {
			var glRenderer = new THREE.WebGLRenderer({alpha:true,antialias:true});

				// renderer = new THREE.CanvasRenderer();
				// renderer.setClearColor( 0xf0f0f0 );
				// renderer.setSize( window.innerWidth, window.innerHeight );
				// // container.appendChild( renderer.domElement );

				// effect = new THREE.AsciiEffect( renderer );
				// effect.setSize( window.innerWidth, window.innerHeight );
				// container.appendChild( effect.domElement );
			// glRenderer = renderer;

			// glRenderer.setClearColor(0xECF8FF);
			glRenderer.setPixelRatio(window.devicePixelRatio);
			// glRenderer.setSize(window.innerWidth, window.innerHeight);
			// glRenderer.domElement.style.position = 'absolute';
			// glRenderer.domElement.style.zIndex = 1;
			// glRenderer.domElement.style.top = 0;

			// glRenderer.setClearColor(0xdddddd);
			glRenderer.setClearColor(0xECF8FF);
			glRenderer.setSize(window.innerWidth, window.innerHeight);
			glRenderer.shadowMap.enabled = true;
			// renderer.shadowMap.type = THREE.BasicShadowMap;
			glRenderer.shadowMapType = THREE.PCFSoftShadowMap;
			glRenderer.shadowMapSoft = true;


			return glRenderer;
		},
		createCssRenderer: function() {
			var cssRenderer = new THREE.CSS3DRenderer();
			cssRenderer.setSize(window.innerWidth, window.innerHeight);
			cssRenderer.domElement.style.position = 'absolute';
			this.glRenderer.domElement.style.zIndex = 0;
			cssRenderer.domElement.style.top = 0;
			return cssRenderer;
		},
		create3dPage: function(w, h, position, rotation, url) {
			var plane = createPlane(
					w, h,
					position,
					rotation);
			glScene.add(plane);
			var cssObject = createCssObject(
					w, h,
					position,
					rotation,
					url);
			cssScene.add(cssObject);
		},
		createCssObject : function (w, h, position, rotation, url) {
			var html = [
				'<div style="width:' + w + 'px; height:' + h + 'px;">',
				'<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
				'</iframe>',
				'</div>'
			].join('\n');
			var div = document.createElement('div');
			$(div).html(html);
			var cssObject = new THREE.CSS3DObject(div);
			cssObject.position.x = position.x;
			cssObject.position.y = position.y;
			cssObject.position.z = position.z;
			cssObject.rotation.x = rotation.x;
			cssObject.rotation.y = rotation.y;
			cssObject.rotation.z = rotation.z;
			return cssObject;
		},
		createPlane: function(w, h, position, rotation) {
			var material = new THREE.MeshBasicMaterial({
				color: 0x000000,
				opacity: 0.0,
				side: THREE.DoubleSide
			});
			var geometry = new THREE.PlaneGeometry(w, h);
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = position.x;
			mesh.position.y = position.y;
			mesh.position.z = position.z;
			mesh.rotation.x = rotation.x;
			mesh.rotation.y = rotation.y;
			mesh.rotation.z = rotation.z;
			return mesh;
		}
	});
	
	return GLBoard;
}();


// UMD (Universal Module Definition)
;(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return GLBoard;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {
	
		// Node.js
		module.exports = GLBoard;
	
	} else if (typeof root !== 'undefined') {
	
		// Global variable
		root.GLBoard = GLBoard;
	
	}

})(this);