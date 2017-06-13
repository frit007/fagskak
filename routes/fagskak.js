
module.exports = function(users) {
	var express = require('express');
	var router = express.Router();

	// var mysql      = require('mysql');

	// var connection = mysql.createConnection({
	//   host     : 'localhost',
	//   user     : 'root',
	//   password : '',
	//   database : 'fagskak'
	// });

	// // connect
	// connection.connect();

	router.use(users.requireLogin)

	/* GET users listing. */
	router.get('/', function(req, res, next) {
		// connection.query('Select * from users', function(error,results,fields) {
		// 	if (error) throw error;
		// 	console.log(results);
		// });
	// res.send('respond with a resource');
		// res.render('lobby', { title: 'Lobby' });
		res.render('fagskak', { title: req.RANDOMTEXT });
	});

	return router;
}