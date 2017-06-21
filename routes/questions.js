var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');


module.exports = function(users, questions, categories) {

	router.use(users.requireLogin);

	/* GET users listing. */
	router.get('/', function(req, res, next) {
		// res.send(users.signIn());
		// res.render('questions/index', { title: 'Questions',
		// 	success: true,
		// });
		// return;
		categories.get(function(err, categories) {
			res.render('questions/index', { title: 'Questions',
				categories: categories,
				err: req.session.err,
				Title: req.session.Title,
				Answers: req.session.Answers,
				Difficulty: req.session.Difficulty,
				Category: req.session.Category,
				success: req.session.success,
			});
			delete req.session.err;
			delete req.session.Title;
			delete req.session.Answers;
			delete req.session.Difficulty;
			delete req.session.Category;
			delete req.session.success;
		})

	});
	router.post('/store', function(req, res) {



		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			try{
				var Answers = JSON.parse(fields.Answers);
			} catch(err) {
				return putErrorOnSession("Please add valid answers");
			}
			function putErrorOnSession(err) {
				req.session.err = err;
				req.session.Title = fields.Title
				req.session.Answers = Answers;
				req.session.Difficulty = fields.Difficulty;
				req.session.Category = fields.Category;
				res.redirect("/questions");
			}
			if(fields.Category === "error") {
				return putErrorOnSession("Please select a category");
			}
			if(fields.Difficulty === "error") {
				return putErrorOnSession("Please select a difficulty");
			}
			

			console.log(form)
			if(err) throw err;
			var oldpath = files.Image.path;
			var uploadPath = '/public/images/uploads/';
			var fileName = Date.now() + '_' + fields.Title;
			var extension = files.Image.name.substr(files.Image.name.indexOf("."));
			var filePath = uploadPath + fileName + extension;
			var newpath = process.cwd() + filePath;
			fs.rename(oldpath, newpath, function (err) {
				if (err) throw err;
				questions.create(fields.Title, fields.Category, req.user.id, fields.Difficulty, filePath, Answers, function(err, result) {
					if(err) {
						return putErrorOnSession(err);
					} else {
						req.session.success=true;
						res.redirect("/questions");
					}
					// res.redirect('/questions');
				}) 
    		});
		});
	});
	return router;
}

//module.exports = router;
