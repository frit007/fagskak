

var Group = require("./Group");
var Team = require("./Team");
var randomstring = require("randomstring");

/**
 * Lobby constructor
 * 
 * @param {User} owner 
 * @param {Object} options 
 */
function Lobby (owner, options) {

	Group.apply(this, arguments);

	this.owner = owner;

	var defaultOptions= {
			name: "no name",
			/**
			 * Contains the current info of the lobby
			 * 
			 * @param {Object} info 
			 */
			onUpdate: function(info){},

			onDisband: function() {},

			password: "",

			// has to overwritten
			id: "",

		}


	// merge the default options and the 
	this.options = Object.assign(defaultOptions, options);


	
    this.teams = {};

	this.teams["spectators"] = new Team({
		id:"spectators",
		playable: false,
		onUpdate: (info) => {
			this.emit("team", info);
		},
		onDisband: () => {
			this.emit("team", this.teams["spectators"].getInfo());
		},
		color: "#CCCCCC",
		name: 'Spectators <i class="fa fa-eye" aria-hidden="true"></i>'
	})
	this.spectators = this.teams["spectators"];

	setupLobbySockets(this);
}



Lobby.prototype = Object.create(Group.prototype);
Lobby.prototype.constructor = Lobby;

Object.assign(Lobby.prototype,{
	/**
	 * check if lobby has a password
	 * 
	 * @returns {Boolean} returns true if it has a password
	 */
	hasPassword: function() {
		return this.options.password !== ""; 
	},

	emitTeams: function() {
		this.emit("teams", this.getTeamInfo());
	},

	getTeamInfo: function() {
		var info = {};
		for (var id in this.teams) {
			info[id] = this.teams[id].getInfo();
			
		}
		return info;
	},

	getTeamByUser: function(user) {
		for (var key in this.teams) {
			var team = this.teams[key];
			if (team.containsUser(user)) {
				return team;
			}
		}
		return null;
	},

	createTeam: function(options) {
		var uniqueId = this.getUniqueId();
		options.id = uniqueId;
		options.onUpdate = (info) => {
			this.emit("team", info)
		}
		options.onDisband = () => {
			this.emit("removeTeam", uniqueId)
			delete this.teams[uniqueId];
		}
		var team = new Team(options)
		this.teams[uniqueId] = team;

		return team;
	},
    
	getUniqueId: function() { 
        do{
            var uniqueStr = randomstring.generate({length: 30, charset: 'alphabetic'});
        }while(typeof this.teams[uniqueStr] !== "undefined");

        return uniqueStr;
    },

	getInfo: function() {
		return {
			id: this.options.id,
			name: this.options.name,
			owner: this.owner.display_name,
			playerCount: this.users.length,
			usesPassword: this.hasPassword(),
		}
	},

	/**
     * Get a Team from a id
     * 
     * @param {String} id
     * @return {Team} 
     */
    getTeamById: function(id) {
        return this.teams[id];
    },


	join: function(user, password) {
		if (this.hasPassword && password !== this.options.password) {
			return false;
		}
		user.addToGroup(this);

		// by default all users are put in the spectator category
		this.spectators.join(user);

		this.options.onUpdate(this.getInfo());
		
		return true;
	},

	leave: function(user) {
		if (this.containsUser(user)) {
			var team = this.getTeamByUser(user);
			if (team !== null) {
				team.leave(user);
			}

			this.removeUser(user);

			if (this.users.length >= 1) {
				if (!this.containsUser(this.owner)) {
					// if the owner left make the next person owner
					this.owner = this.users[0]
				}
				this.options.onUpdate(this.getInfo());
			} else {
				this.options.onDisband();
			}
		}
	}
});

function setupLobbySockets(lobbyGroup) {
    console.log(lobbyGroup);
    // lobbiesGroup.on("connected", function(message) {
    //     console.log("hello");
    // });

    lobbyGroup.on('getTeams', function(message) {
        // console.log("client", this);
        this.socket.emit("teams", lobbyGroup.getTeamInfo());
    })

    lobbyGroup.on('disconnected', function(message) {
        // this.removeFromGroup(lobbyGroup);
    })

	lobbyGroup.on('createTeam', function(options) {
		// throw "Not implemented";
		var team = lobbyGroup.createTeam(options);
		// this is the user
		team.join(this);
	})

    lobbyGroup.on('joinTeam', function(joinRequest, ack) {
        var team = lobbyGroup.getTeamById(joinRequest.id);

        if (typeof team === 'undefined') {
            ack({error: "team does not exist", success: false});
            return;
        }

		// "this" is the user who sent the request 
		if (!team.containsUser(this)) {
			team.join(this);
		}

		ack({success: true});
    })

	lobbyGroup.on('isLobbyOwner', function(message) {
		
	})

}




// UMD (Universal Module Definition)
;(function (root) {

	if (typeof define === 'function' && define.amd) {

		// Asynchronous Module Definition(AMD)
		define([], function () {
			return Lobby;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {
	
		// Node.js
		module.exports = Lobby;
	
	} else if (typeof root !== 'undefined') {
	
		// Global variable
		root.Lobby = Lobby;
	
	}

})(this);