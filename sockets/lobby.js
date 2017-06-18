module.exports = function(users, socket, sessionMiddleware, lobbies) {

    var lobbyNamespace = socket.of('/lobby');

	lobbyNamespace.use(function(socket, next) {
		// get user session 
		sessionMiddleware(socket.request, socket.request.res, next)
	});
	// make sure the user is logged in
	lobbyNamespace.use(users.requireSocketLogin);

	lobbyNamespace.use(lobbies.requireSocketLobby.bind(lobbies));


	lobbyNamespace.on('connection',function(client) {
		// client.user.addToGroup(lobbies);
		// if user
	})

}