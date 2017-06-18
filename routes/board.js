var express = require('express');
var router = express.Router();

module.exports = function(users, boards) {

	router.use(users.requireLogin);

	router.post('/create', function(req,res,next) {
        var fields = JSON.parse(req.body.fields);
        boards.create(req.body.name, fields, function(err, message) {
            if (err) {
                res.send(400,err);
                return;
            }
            res.send("success");
        })
	});

    router.get('/get', function(req,res,next) {
        boards.getBoards(function(err, boards) {
            if (err) {
                res.send(400, err);
                return;
            }
            res.send(JSON.stringify(boards));
        })
    });


	return router;
}