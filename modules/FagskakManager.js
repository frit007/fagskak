

fagskakGames = [];

module.exports = function(mysqlPool, questions) {
    var Fagskak = require("./Fagskak.js")(mysqlPool, questions);
    return {
        /**
         * Get a fagskak instance by user
         * 
         * @param {User} user 
         */
        getGameFromUser: function(user) {
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

        /**
         * Create new Fagskak game
         * 
         * @param {[{categoryId: , difficulty: number, boardGroupId: number},...]} fieldBindings 
         * @param {Lobby} lobby 
         * @param {number} movementLimit 
         * @param {number} timeLimitInMinutes 
         * @param {function} callback 
         * @returns 
         */
        createGame: function(fieldBindings, lobby, movementLimit, timeLimitInMinutes, callback) {
            if(!lobby) {
                callback("You are not in a lobby");
                return;
            }

            if(!fieldBindings) {
                callback("Please configure the board before starting the game")
                return;
            }
            
            // var teams = lobby.getTeamInfo();
            if(lobby.teams.length <= 1) {
                callback("There have to be atleast one team present.");
                return;
            }

            if(!(movementLimit && movementLimit > 0 )) {
                callback("Movement limit has to be bigger than 0");
                return;
            }

            if(!(timeLimitInMinutes && timeLimitInMinutes > 0)) {
                callback("Time limit has to be bigger than 0 minutes");
                return;
            }

            var game = new Fagskak();
            const secondsPerMinutes = 60;

            // convert minutes to seconds
            var timeLimitInSeconds = secondsPerMinutes * timeLimitInMinutes; 
            game.newFieldBindings(fieldBindings,
            lobby,
            movementLimit,
            timeLimitInSeconds, 
            function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    lobby.transferToGroup(game);

                    // kill the lobby so nobody is able to join it
                    lobby.options.onDisband();
        
                    callback(null, data);

                    
                    this.fagskakGames.push(game) ;

                    // get everybody to join the game
                    game.emit("redirect", "/fagskak");

                }
            });

        }
    }
}