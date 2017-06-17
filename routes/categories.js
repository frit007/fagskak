var express = require('express');
var router = express.Router();
var util = require('util');


module.exports = function(users, categories) {

	// router.use(users.requireLogin);

    router.get('/', function(req, res) {
        categories.get(function(err, categories) {
            res.render('categories/index', {title: 'Categories', categories: categories});
        })
    });

	router.get('/create', function(req, res) {
        res.render("categories/create", {title: "create Category",error: req.session.error});
        delete req.session.error;
	});

    router.post('/store', function(req, res) {
        req.checkBody('name', 'Invalid Name').isAlpha();
        req.checkBody('color', 'Invalid Color').isHexColor();
        req.getValidationResult().then(function(result){
            if (!result.isEmpty()) {
                req.session.error = "Validation errors "+ result.array()[0].msg;
                res.redirect("/categories/create");
                return;
            }
            categories.create(req.body.name, req.body.color, function(err, categoryId) {
                if (err) {
                    req.session.error = "Validation errors "+ util.inspect(result.array());
                    res.redirect("/categories/create");
                } else {
                    res.redirect("/categories");
                }
            });
        })
    })

    router.get('/edit/:id', function(req, res) {
        categories.find(req.params.id, function(err, category) {
            res.render("categories/edit", {title: "Edit Category", category: category, error: req.session.error});
            delete req.session.error;
        });
    });

    router.post('/update/:id', function(req, res) {
        req.checkBody('name', 'Invalid Name').isAlpha();
        req.checkBody('color', 'Invalid Color').isHexColor();
        req.getValidationResult().then(function(result){
            if (!result.isEmpty()) {
                req.session.error = "Validation errors "+ result.array()[0].msg;
                res.redirect("/categories/edit/" + req.params.id);
                return;
            }
            categories.update(req.params.id, req.body.name, req.body.color, function(err, status) {
                if (err) {
                    req.session.error = err;
                    res.redirect("/categories/edit/" + req.params.id);
                } else {
                    res.redirect("/categories");
                }
            });
        });
    });

    router.get('/destroy/:id', function(req, res) {
        categories.delete(req.params.id, function(err){
            if (err) {
                res.send(400, err);
            }
            res.redirect("/lobbbies");
        })
    });

	return router;
}