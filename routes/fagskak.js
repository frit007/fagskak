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
		var team = game.getTeamByUser(req.user);
		if (team.options.playable) {
			res.render('fagskak/client', { title: "Fagskak", });			
		} else {
			res.render('fagskak/spectator', { title: "Fagskak", layout: 'layouts/no_nav'});
		}
	});

	/**
	 * @body {[{categoryId: , difficulty: number, boardGroupId: number},...]} fields
	 * @body {number} movement_limit
	 * @body {number} time_limit_in_seconds
	 */
	router.post('/store', function(req, res) {
		var fields = JSON.parse(req.body.fields);
		var movementLimit = req.body.movement_limit;
		var timeLimitInMinutes = req.body.time_limit_in_minutes;
		var lobby = lobbies.getLobbyFromUser(req.user);
		fagskakManager.createGame(fields, lobby, movementLimit, timeLimitInMinutes, function(err, data) {
			if(err) {
				res.status(400).send(err);
			} else {
				res.send("success");
			}
		});
	})

	return router;
}