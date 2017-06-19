var Group = require("./Group");


function Fagskak(mysql, teams, overview) {
    this.mysql = mysql;
    
    this.teams = teams;
    this.overview = overview;

	setupLobbySockets(this);
}

Fagskak.prototype = Object.create(Group.prototype);
Fagskak.prototype.constructor = Fagskak;

Object.assign(Fagskak.prototype, {
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

    getInfo: function() {
		throw "Not implemented"
	},
})


function setupLobbySockets(Fagskak) {

}


// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // Asynchronous Module Definition(AMD)
        define([], function () {
            return Fagskak;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Fagskak;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Fagskak = Fagskak;
    
    }

})(this);