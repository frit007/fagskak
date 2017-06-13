var Group = require ('./Group');
var Lobby = require ("./Lobby");
var randomstring = require("randomstring");

var Lobbies = function() {
    Group.apply(this, arguments);
    setupLobbySockets(this);
    this.lobbies = {};
}

Lobbies.prototype = Object.create(Group.prototype);
Lobbies.prototype.constructor = Lobbies;
Object.assign(Lobbies.prototype, {
    /**
     * Create lobby
     * 
     * @param {User} owner 
     * @param {Object} options 
     * @returns 
     */
    createLobby: function(owner, options) {
        var uniqueId = this.getUniqueId();

        options.id = uniqueId;

        var lobby = new Lobby(owner, Object.assign(options,{
            onUpdate: (info) => {
                // this.emit("updatedLobby", info)
                this.emitLobbies();
            },
            onDisband: () => {
                delete this.lobbies[uniqueId];

                this.emitLobbies();
            }
        }));

        // this.emit("addedLobby", lobby.getInfo());
        this.lobbies[uniqueId] = lobby;

        // add the owner to the newly created group
        owner.addToGroup(lobby);

        this.emitLobbies();

        return lobby;
    },

    /**
     * get a lobby from a user
     * 
     * @param {User} user 
     */
    getLobbyFromUser: function(user) {
        for (var key in this.lobbies) {
            var lobby = this.lobbies[key];

            if (lobby.containsUser(user)) {
                return lobby;
            }
        }

        return null;
    },


    /**
     * Get a lobby from a id
     * 
     * @param {String} id
     * @return {Lobby} 
     */
    getLobbyById: function(id) {
        return this.lobbies[id];
    },

    emitLobbies: function() {
        this.emit("lobbies", this.getLobbyInfo());
    },

    getLobbyInfo: function() {
        var info = {};
        for(var id in this.lobbies) {
            info[id] = this.lobbies[id].getInfo();
        }
        return info;
    },


    getUniqueId: function() { 
        do{
            var uniqueStr = randomstring.generate({length: 30, charset: 'alphabetic'});
        }while(typeof this.lobbies[uniqueStr] !== "undefined");

        return uniqueStr;
    },

    requireLobby: function(req, res, next)  {
                
        var lobby = this.getLobbyFromUser(req.user);

        if (lobby === null) {
            res.redirect("/lobbies");
        } else {
            req.lobby = lobby;
            next();
        }

    },
    requireSocketLobby: function(socket, next)  {
        var lobby = this.getLobbyFromUser(socket.user);
        if (lobby === null) {
            next("Not in lobby", false);
        } else {
            socket.lobby = lobby;

            next();
        }
    }
});


function setupLobbySockets(lobbiesGroup) {
    console.log(lobbiesGroup);
    // lobbiesGroup.on("connected", function(message) {
    //     console.log("hello");
    // });

    lobbiesGroup.on('getLobbies', function(message) {
        // console.log("client", this);
        this.socket.emit("lobbies", lobbiesGroup.getLobbyInfo());
    })

    lobbiesGroup.on('disconnected', function(message) {
        this.user.removeFromGroup(lobbiesGroup);
    })

    lobbiesGroup.on('join', function(joinRequest, ack) {
        var lobby = lobbiesGroup.getLobbyById(joinRequest.id);

        if (typeof lobby === 'undefined') {
            ack({error: "Lobby does not exist", success: false});
            return;
        }

        // "this" is the user sending the message
        if (lobby.join(this, joinRequest.password)) {
            ack({success: true});
        } else {
            ack({error: 'Wrong password', success: false});
        }
    })

}



// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // Asynchronous Module Definition(AMD)
        define([], function () {
            return Lobbies;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Lobbies;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Lobbies = Lobbies;
    
    }

})(this);