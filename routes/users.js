	var express = require('express');
var router = express.Router();

module.exports = function(users) {

	router.use(users.requireLogin);

	router.get('/edit', function(req,res,next) {
		// req.user.getUserProfile(function(user_info){
		var user = req.user;
		res.render("users/edit", {title: "Edit user", display_name: user.display_name});
		// })
		// users.getUserProfile(req.cookies.oauthCode, function(err, User) {
			// if (err) {
			// 	if (err === "no_token") {
			// 		res.redirect("/auth");
			// 		return;
			// 	}else {
			// 		throw err;
			// 	}
			// }
			// console.log(User)
			//res.send("basic");
			// res.render("users/edit", {title: "Edit user", display_name: User.display_name});

		// });
		// res.send(JSON.stringify(req.cookies.oaut6hCode));
	});

	router.get('/update_name', function(req,res,next) {
		var user = req.user;
		user.updateName(req.query.name, function(err,status) {
			if (err) {
				// res.status(500);
				throw err;
			}
			res.send(JSON.stringify({success: status}));
		});
	})

	router.get('/update', function(req,res,next) {
		// res.send(req.cookies.oauthCode);
	});

	return router;
}