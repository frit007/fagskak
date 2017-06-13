var express = require('express');
var router = express.Router();


module.exports = function(users) {

	router.use(users.requireLogin);

	/* GET users listing. */
	router.get('/', function(req, res, next) {
		// res.send(users.signIn());
		res.render('questions/index', { title: 'Questions', display_name: req.user.display_name});
	});

	return router;
}

//module.exports = router;
