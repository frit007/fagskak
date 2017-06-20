var express = require('express');
var router = express.Router();

module.exports = function(users, lobbies, fagskakManager) {

	router.use(users.requireLogin)
	// router.use(fagskakManager.requireGame)
	
	router.get('/', function(req, res) {
		var game = fagskakManager.getGameFromUser(req.user);

		if(!game) {
			// if the user is currently in a game then redirect him to the lobbies
			res.redirect("/lobbies");
			return;
		}

		res.render('fagskak', { title: "Fagskak" });
	});

	router.post('/store', function(req, res) {
		var fields = req.body.fields;
		var lobby = lobbies.getLobbyByUser(req.user);
		fagskakManager.createGame(fields, lobby, function(err, data) {
			if(err) {
				res.send(400, err);
			} else {
				res._write("success");
			}

		});
	})

	return router;
}