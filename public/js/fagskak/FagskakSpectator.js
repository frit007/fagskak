function FagskakSpectator(container, socket){
    this.glboard = new GLBoard({
		container: container
	});

    this.setupSocket(socket);
}

FagskakSpectator.prototype = {
    setupSocket: function(socket) {
        // socket.on();
    },
}