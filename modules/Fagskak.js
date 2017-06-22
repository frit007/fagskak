var Group = require("./Group");

module.exports = function(mysqlPool, questions) {
	
	/**
	 * 
	 * 
	 * @param {[Boardbinding]} BoardBindings 
	 * @param {[Team]} teams 
	 */
	function Fagskak(BoardBindings, teams) {
		Group.apply(this, arguments);
		this.teams = {};

		setupLobbySockets(this);
	}
	
	Fagskak.prototype = Object.create(Group.prototype);
	Fagskak.prototype.constructor = Fagskak;

	Object.assign(Fagskak.prototype, {
		
		loadFromMysql: function(FagskakId) {

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

		getInfo: function() {
			throw "Not implemented"
		},
	})


	function setupLobbySockets(Fagskak) {

	}

	return Fagskak;
}