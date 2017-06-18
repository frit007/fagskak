var underscore = require("../public/js/underscore");

module.exports = function(mysqlPool) {
    var Board = {
        create: function(name, fields, callback) {
            mysqlPool.getConnection( function(err, connection) {
                connection.beginTransaction(function(err) {
                    if (err) {
                        connection.release();
                        callback(err);
                        return;
                    }
                    connection.query('INSERT INTO board_groups(name) VALUES (?)', [name], function(err, group) {
                        if (err) {
                            callback(err);
                            connection.rollback(function() {
                                connection.release();
                            });
                            return;
                        }
                        
                        
                        connection.query('INSERT INTO board_field_groups(board_field_id, board_group_id) SELECT bf.id, ? from board_fields as bf where (bf.x,bf.z) in (?) and bf.y = 0',
                        [group.insertId, fields],
                        function(err, data) {
                            if (err) {
                                callback(err)
                                connection.rollback(function() {                                
                                    connection.release();
                                });
                                return;
                            }
                            connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function(err) {
                                        connection.release();
                                        callback(err);
                                    })
                                } else {
                                    connection.release();
                                    callback(null, group.insertId);
                                }
                            })
                        })
                    });
                })
            })
        },
        boardExists: function() {

        },
        getBoards: function(callback) {
            mysqlPool.getConnection( function(err, connection) {
                connection.query("select bf.x, bf.z, bg.name, bg.id as board_group_id "+
                "from board_groups as bg "+
                "join board_field_groups as bfg on bfg.board_group_id = bg.id "+
                "join board_fields as bf on bf.id = bfg.board_field_id",
                function(err, rows) {
                    connection.release();
                    if (err) {
                        callback(err);
                        return;
                    }
                    var boards = {};
                    for (var index = 0; index < rows.length; index++) {
                        var row = rows[index];
                        if (typeof boards[row.board_group_id] === "undefined") {
                            boards[row.board_group_id] = {
                                name: row.name,
                                fields: [],
                                id: row.board_group_id
                            }
                        }
                        boards[row.board_group_id].fields.push({x: row.x, z: row.z});
                    }
                    callback(null, boards);
                })
            });
        }
    }

	return Board;
}