var underscore = require("../public/js/underscore");

module.exports = function(mysql) {
    var Board = {
        create: function(name, color, callback) {
            mysql.query('INSERT INTO question_categories(name, color) VALUES(?,?)',[name, color], function(err, data){
                if (err) {
                    callback(err);
                } else {
                    callback(null, data.insertedId);
                }
            });
        },
        
        update: function(id, name, color, callback) {
            mysql.query('UPDATE question_categories SET name = ?, color = ? where id = ?', [name, color, id], function(err, updated) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, "success");
                }
            });
        },

        get: function(callback) {
            mysql.query('SELECT * from question_categories', function(err, rows) {
                callback(err, rows);
            });
        },

        find: function(id, callback) {
            mysql.query('SELECT * from question_categories where id = ?', [id], function(err, rows) {
                callback(err,rows[0]);
            });
        },

        delete: function(id, callback) {
            mysql.query('DELETE FROM question_categories where id = ?', [id], function(err, row) {

            });
        }
    }

	return Board;
}