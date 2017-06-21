"user strict"

function FagskakClient(socket) {


	this.socket = socket;

	this.setupSockets(socket);
}

FagskakClient.prototype = {
	setupSockets: function(socket) {
		socket.on('/log', function() {
			
		})
	}
}
