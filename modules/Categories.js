var underscore = require("../public/js/underscore");

module.exports = function(mysqlPool) {
    var Board = {
        create: function(name, color, callback) {
            mysqlPool.getConnection( function(err, connection) {
                connection.query('INSERT INTO question_categories(name, color) VALUES(?,?)', [name, color], function(err, data){
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, data.insertedId);
                    }
                });
            });
        },
        
        update: function(id, name, color, callback) {
            mysqlPool.getConnection(function(err, connection){
                connection.query('UPDATE question_categories SET name = ?, color = ? where id = ?', [name, color, id], function(err, updated) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, "success");
                    }
                });
            })
        },

        get: function(callback) {
            mysqlPool.getConnection(function(err, connection) {
                connection.query('SELECT * from question_categories', function(err, rows) {
                    connection.release();
                    var categories = {};
                    for (var index = 0; index < rows.length; index++) {
                        var row = rows[index];
                        categories[row.id] = row;
                    }
                    callback(err, categories);
                });

            })
        },

        find: function(id, callback) {
            mysqlPool.getConnection(function(err, connection) {
                connection.query('SELECT * from question_categories where id = ?', [id], function(err, rows) {
                    connection.release();
                    callback(err,rows[0]);
                });
            })
        },

        delete: function(id, callback) {
            mysqlPool.getConnection(function(err, connection) {
                connection.query('DELETE FROM question_categories where id = ?', [id], function(err, row) {
                    connection.release();
                    callback(err);
                });
            })

        }
    }

	return Board;
}