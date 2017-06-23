function FagskakSpectator(container, socket, setup){
    setup = setup || {};

    this.board = new GLBoard({
		container: container
	});

    this.setupFigures(setup.figures);

    this.setupSocket(socket);
}

FagskakSpectator.prototype = {
    setupFigures: function(figures) {
        if (!figures) {
            return;
        }
        this.figures = {};
        for (var key in figures) {
            if (figures.hasOwnProperty(key)) {
                var figureInfo = figures[key];

                var figure = new GLFigure(
                    figureInfo.position.x,
                    figureInfo.position.y,
                    figureInfo.position.z,
                    this.board,
                    'pawn',
                    this.board.glScene
                );
                figure.setColor(figureInfo.color)
                
                this.figures[figureInfo.teamId] = figure;
            }
        }
    },
    setupSocket: function(socket) {
        // socket.on();

        socket.on("move", (data) => {
            console.log("move", data)
            var figure = this.figures[data.team];
            if (figure) {
                var coords = data.coords;
                figure.goto(coords.x, coords.y, coords.z, function(err) {
                    if (err) {
                        socket.emit("directedError", {error: err, target: data.sendBy});                    
                    }
                });
            }
        })
    },
}