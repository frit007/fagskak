var Group = require("./Group");


/**
 * Lobby constructor
 * 
 * @param {Object} options 
 */
function Team (options) {

	Group.apply(this, arguments);


	var defaultOptions= {
			name: "No name",
			/**
			 * Contains the current info of the lobby
			 * 
			 * @param {Object} info 
			 */
			onUpdate: function(info){},

			onDisband: function() {},

            color: "#FFFFFF",

			// has to overwritten
			id: "",

            // determine if a team is allowed to play
            playable: true

		}


	// merge the default options and the 
	this.options = Object.assign(defaultOptions, options);

    setupLobbySockets(this);
}



Team.prototype = Object.create(Group.prototype);
Team.prototype.constructor = Team;

Object.assign(Team.prototype,{

	
	getInfo: function() {
		var options = this.options;
		return {
            name: options.name,
            id: options.id,
            playable: options.playable,
            color: options.color,
            users: this.getUsersInfo()
		}
	},

    emitOptions: function() {
        
    },

    getUsersInfo: function() {
        var info = [];
        for (var index = 0; index < this.users.length; index++) {
            var user = this.users[index];
            info.push({
                display_name: user.display_name,
                id: user.id
            });
            
        }
        return info;
    },
	
	join: function(user, password) {
        // remove the user from any teams he is currently in
        for (var index = 0; index < user.groups.length; index++) {
            var group = user.groups[index];
            if (group instanceof Team) {
                group.leave(user);
            }
        }

        // add the user to this team
		user.addToGroup(this);

        user.emit("teamOptions", this.getInfo());

		this.options.onUpdate(this.getInfo());
		
		return true;
	},

	leave: function(user) {
		if (this.containsUser(user)) {

			this.removeUser(user);
            
			if (this.users.length >= 1) {
				this.options.onUpdate(this.getInfo());
			} else {
                this.disband();
				this.options.onDisband();
			}
		}
	}
});


function setupLobbySockets(team) {
    
    team.on('teamUpdate', function(changes) {
        team.options.color = changes.color;
        team.options.name = changes.name;
        team.options.onUpdate(team.getInfo());
        team.emit("teamOptions", team.getInfo());
    })

    team.on('getTeamOptions', function() {
        this.emit("teamOptions", team.getInfo());
    })
}



// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // Asynchronous Module Definition(AMD)
        define([], function () {
            return Team;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Team;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Team = Team;
    
    }

})(this);