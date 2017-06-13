var express = require('express');
var router = express.Router();


// var socketGroup = require('./modules/socketGroup');

module.exports = function(users, socket, sessionMiddleware, lobbies) {

	router.use(users.requireLogin);
	router.use(lobbies.requireLobby.bind(lobbies));

	router.get('/', function(req, res, next) {
		// var socketAuthToken = req.user.generateSocketAuth();
		res.render('lobby/index', { title: 'Lobbies'});
	});


	router.get('/leave', function(req, res, next){
		req.lobby.leave(req.user);
		res.redirect("/lobbies");
	})

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

	return router;
}

