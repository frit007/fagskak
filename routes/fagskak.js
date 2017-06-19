var express = require('express');
var router = express.Router();

module.exports = function(users, fagskakManager) {

	router.use(users.requireLogin)
	router.use(fagskakManager.requireGame)

	/* GET users listing. */
	router.get('/', function(req, res) {
		res.render('fagskak', { title: "Fagskak" });
	});

	return router;
}