module.exports = function(users, socket, sessionMiddleware, fagskakManager) {

    var fagskakNamespace = socket.of('/fagskak');
	
	fagskakNamespace.use(function(socket, next) {
		// get user session 
		sessionMiddleware(socket.request, socket.request.res, next)
	});
    // make sure the user is logged in
	fagskakNamespace.use(users.requireSocketLogin);
    fagskakNamespace.use(fagskakManager.requireSocketLogin)

	// fagskakNamespace.on('connection',function(client) {

	// 	client.user.addToGroup(lobbies);
	// })

}