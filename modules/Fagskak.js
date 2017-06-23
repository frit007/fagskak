var Group = require("./Group");
var Board = require("../public/js/fagskak/Board");
var Figure = require("../public/js/fagskak/Figure")
module.exports = function(mysqlPool, questions, users) {


	/**
	 * 
	 * @param {number} gameId
	 * @param {[Boardbinding]} BoardBindings 
	 * @param {[Team]} teams 
	 * @param {object} options
	 */
	function Fagskak(gameId, BoardBindings, teams, options) {
		Group.apply(this, arguments);

		// all members of the teams join this group
		for (var teamKey in teams) {
			if (teams.hasOwnProperty(teamKey)) {
				var team = teams[teamKey];
				for (var userKey in team.users) {
					if (team.users.hasOwnProperty(userKey)) {
						var user = team.users[userKey];
						user.addToGroup(this);
					}
				}
			}
		}
		
		if (gameId === null) {
			throw "Game must have an id";
		}

		options = options || {};
		
		var defaultOptions = {
			// called when the game is done
			onDisband: function(){}
		};

		this.options = Object.assign(defaultOptions, options);

		this.id = gameId;
		this.teams = teams || null;
		

		this.playingTeams = [];
		this.spectatorTeam = null;

		for (var key in teams) {
			if (teams.hasOwnProperty(key)) {
				var team = teams[key];
				if (team.options.playable) {
					this.playingTeams.push(team);
				} else {
					this.spectatorTeam = team;
				}
			}
		}

	


		this.initializeBoard();
		this.gameLoop();


		setupLobbySockets(this);
	}
	
	Fagskak.prototype = Object.create(Group.prototype);
	Fagskak.prototype.constructor = Fagskak;

	Object.assign(Fagskak.prototype, {
		initializeBoard: function() {
			this.board = new Board();
			for (var index = 0; index < this.playingTeams.length; index++) {
				var team = this.playingTeams[index];
				var x = Math.floor(Math.random() * 10) + 1 + 4;
				var z = Math.floor(Math.random() * 10) + 1 + 4;
				var y = 0; // start figure on floor
				team.figure = new Figure(x,0,z,this.board);
			}
		},
		gameLoop: function() {

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

		getFigures: function() {
			var figures = {};
			for (var index = 0; index < this.playingTeams.length; index++) {
				var team = this.playingTeams[index];
				figures[team.options.id] = {
					teamId: team.options.id,
					position: team.figure.getCoord(),
					color: team.options.color,
				}
			}
			return figures;
		}
	})


	function setupLobbySockets(fagskak) {
		fagskak.on('startClient', function() {
			this.emit("startClient", {});
		});

		fagskak.on('startSpectator', function(){
			this.emit('startSpectator', {figures: fagskak.getFigures()});
		});

		fagskak.on('directedError', function(data){
			var user = users.getUserWithId(data.target);
			if (user) {
				user.emit("errorLog", data.error);
			}
		})

		fagskak.on('move', function(coords) {
			var team = fagskak.getTeamByUser(this);
			if (team) {
				fagskak.emit('move', {team: team.options.id,
					 coords: coords,
					sendBy: this.id})			
			}
		})


	}

	return Fagskak;
}