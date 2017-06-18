module.exports = function(users, socket, sessionMiddleware, lobbies) {

    var lobbiesNamespace = socket.of('/lobbies');
	
	lobbiesNamespace.use(function(socket, next) {
		// get user session 
		sessionMiddleware(socket.request, socket.request.res, next)
	});
		// make sure the user is logged in
	lobbiesNamespace.use(users.requireSocketLogin);


	lobbiesNamespace.on('connection',function(client) {

		client.user.addToGroup(lobbies);
	})

}