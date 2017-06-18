var express = require('express');
var router = express.Router();
var util = require('util');


module.exports = function(users, categories) {

	router.use(users.requireLogin);

    router.get('/', function(req, res) {
        categories.get(function(err, categories) {
            res.render('categories/index', {title: 'Categories', categories: categories});
        })
    });

	router.get('/create', function(req, res) {
        var category = {color: "", name: ""}
        if (req.session.category) {
            Object.assign(category, req.session.category);
            delete req.session.category
        }
        res.render("categories/create", {title: "create Category",error: req.session.error, category});
        delete req.session.error;
	});

    router.post('/store', function(req, res) {
        req.checkBody('name', 'Invalid Name').notEmpty();
        req.checkBody('color', 'Invalid Color').isHexColor();
        req.getValidationResult().then(function(result){
            if (!result.isEmpty()) {
                req.session.category = {color: req.body.color, name: req.body.name}
                req.session.error = result.array()[0].msg;
                res.redirect("/categories/create");
                return;
            }
            categories.create(req.body.name, req.body.color, function(err, categoryId) {
                if (err) {
                    req.session.category = {color: req.body.color, name: req.body.name}
                    if (err.errno === 1062) {
                        req.session.error = "Name and color have to be unique"
                    } else {
                        req.session.error = "Error occured";
                    }
                    // req.session.error = err;
                    res.redirect("/categories/create");
                } else {
                    res.redirect("/categories");
                }
            });
        })
    })

    router.get('/edit/:id', function(req, res) {
        categories.find(req.params.id, function(err, category) {
            if (req.session.category) {
                Object.assign(category, req.session.category);
                delete req.session.category
            }
            res.render("categories/edit", {title: "Edit Category", category: category, error: req.session.error});
            delete req.session.error;
        });
    });

    router.post('/update/:id', function(req, res) {
        req.checkBody('name', 'Invalid Name').notEmpty();
        req.checkBody('color', 'Invalid Color').isHexColor();
        req.getValidationResult().then(function(result){
            if (!result.isEmpty()) {
                req.session.category = {color: req.body.color, name: req.body.name}
                req.session.error = result.array()[0].msg;
                res.redirect("/categories/edit/" + req.params.id);
                return;
            }
            categories.update(req.params.id, req.body.name, req.body.color, function(err, status) {
                if (err) {
                    req.session.category = {color: req.body.color, name: req.body.name}
                    req.session.error = err;
                    res.redirect("/categories/edit/" + req.params.id);
                } else {
                    res.redirect("/categories");
                }
            });
        });
    });

    router.get('/destroy/:id', function(req, res) {
        res.send(500,"Sorry Destroying categories would have too many implications at the moment")
        // categories.delete(req.params.id, function(err){
        //     if (err) {
        //         res.send(400, err);
        //     }
        //     res.redirect("/lobbbies");
        // })
    });

    router.get('/get', function(req, res) {
        categories.get(function(err, categories){
            if (err) {
                res.send(500, err);
            } else {
                res.send(JSON.stringify(categories));
            }
        })
    });

	return router;
}