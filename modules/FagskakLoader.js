module.exports = function(mysqlPool, users) {

    /**
     * 
     * @param {MysqlConnection} connection 
     * @param {{}} data 
     * @param {function} callback 
     */
    function MYSQLTRANSACTIONloadGame(gameId, connection, data, callback) {
        connection.query("INSERT INTO games(name, movement_limit, time_limit_in_seconds) VALUES(?, ?, ?)",
        [lobbyName, movementLimit, timeLimitInSeconds], function(err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, Object.assign(data, {
                    gameId: result.insertId,
                }));
            }
        })
    }

    /**
     * Creates new mysql entries
     * 
     * 
     */
    return function createFagskakGame(gameId, callback) {
        mysqlPool.query("SELECT * FROM games where id = ?", [gameId], function(err, games) {
            if (err) {
                callback(err);
            }
            if (games.length !== 1) {
                callback("Unable to find game with id: " + gameId);
            }
            var game = games[0];
            // mysqlPool.query("SELECT ")
        })

    }



}