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

        requireSocketGame: function(socket, next)  {
            var game = this.getGameFromUser(socket.user);
            if (game === null) {
                next("Not in game", false);
            } else {
                socket.game = game;

                next();
            }
        },

        createGame: function(fieldBindings, lobby, callback) {
            if(!lobby) {
                callback("You are not in a lobby");
            }
            if(!fieldBindings) {
                callback("Please configure the board before starting the game")
            }
            var teams = lobby.getTeamInfo();
            if(teams.length <= 1) {
                callback("There have to be atleast one team present.");
            }

            var game = new Fagskak(mysqlPool, teams, fieldBindings);

        }
    }
}