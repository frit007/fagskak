var express = require('express');
var router = express.Router();


// var socketGroup = require('./modules/socketGroup');

module.exports = function(users, socket, sessionMiddleware, lobbies) {

	router.use(users.requireLogin);
	
	router.get('/', function(req, res, next) {
		console.log(req.user.updateName);

		if (lobbies.getLobbyFromUser(req.user) !== null) {
			res.redirect("/lobby")
			return;
		}

		// var socketAuthToken = req.user.generateSocketAuth();
		res.render('lobbies/index', { title: 'Lobbies'});
	});


	router.post('/create', function(req, res, next) {
		req.checkBody('name').notEmpty();


		req.getValidationResult().then(function(result) {
			if (!result.isEmpty()) {
				res.status(400).json({errors: result.array()});
			} else {

				var lobby = lobbies.createLobby(req.user, {name: req.body.name, password: req.body.password});

				// lobby.addUser(req.user);
                lobby.join(req.user, req.body.password);

				res.status(200).json({})
			}
		})
	});


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


	return router;
}

