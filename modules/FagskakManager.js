var Fagskak = require("./Fagskak.js");

fagskakGames = [];

module.exports = function(mysqlPool, questions) {
    return {
        /**
         * Get a fagskak instance by user
         * 
         * @param {User} user 
         */
        getGameByUser: function(user) {
            for (var index = 0; index < fagskakGames.length; index++) {
                var fagskak = fagskakGames[index];
                if (fagskak.containsUser(user)) {
                    return fagskak;
                }
            }
            return null;
        },

        requireGame: function(req, res, next)  {
                    
            var game = this.getGameFromUser(req.user);

            if (game === null) {
                res.redirect("/lobbies");
            } else {
                req.game = lobby;
                next();
            }

        },

        requireGameLobby: function(socket, next)  {
            var game = this.getGameFromUser(socket.user);
            if (game === null) {
                next("Not in game", false);
            } else {
                socket.game = game;

                next();
            }
        }
    }
}