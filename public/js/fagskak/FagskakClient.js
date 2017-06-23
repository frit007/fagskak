"user strict"

var info = new BootstrapAlert("info", {
    modifiers: {
        danger: {
            hide: 15000
        },
        success: {
            hide: 5000
        },
		info: {
			hide: 41
		}
    }
});

function FagskakClient(container, socket) {

	this.socket = socket;

	this.setupSockets(socket);

	this.setupMovementForm();
}

FagskakClient.prototype = {
	setupMovementForm: function() {
		$("#movebutton").on('click', function(){
			socket.emit('move', {
				x: Number($("#x").val()),
				y: Number($("#y").val()),
				z: Number($("#z").val()),
			})
		})
	},
	setupSockets: function(socket) {

		socket.on('/log', function(data) {
			info.info(data);
		});

		socket.on("errorLog", function(error) {
			info.danger(error);
		});

		socket.emit("startClient", "true");
	}
}
