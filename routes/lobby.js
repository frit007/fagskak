var express = require('express');
var router = express.Router();


// var socketGroup = require('./modules/socketGroup');

module.exports = function(users, lobbies, fagskakManager) {

	router.use(users.requireLogin);
	router.use(lobbies.requireLobby.bind(lobbies));


	router.get('/', function(req, res, next) {
		if (fagskakManager.getGameFromUser(req.user) !== null) {
			res.redirect('/fagskak');
		}

		// var socketAuthToken = req.user.generateSocketAuth();
		res.render('lobby/index', { title: 'Lobby', socketPort: process.env.SOCKET_PORT});
	});


	router.get('/leave', function(req, res, next){
		req.lobby.leave(req.user);
		res.redirect("/lobbies");
	})



	return router;
}

