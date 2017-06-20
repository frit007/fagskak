var Group = require("./Group");

module.exports = function(mysqlPool, questions) {
	
	function Fagskak() {
		Group.apply(this, arguments);
		this.teams = {};

		setupLobbySockets(this);
	}

	Fagskak.prototype = Object.create(Group.prototype);
	Fagskak.prototype.constructor = Fagskak;

	Object.assign(Fagskak.prototype, {
		
		/**
		 * Creates new mysql entries
		 * 
		 * @param {[{category: {color: string, name: string, id: number}, fields: }, difficulty: number, fieldsId: number]} fieldBindings
		 * @param {Lobby} lobby 
		 * @param {number} movementLimit 
		 * @param {number} timeLimitInSeconds 
		 * @param {function} callback 
		 */
		newFieldBindings: function(fieldBindings, lobby, movementLimit, timeLimitInSeconds, callback) {
			this.teams = lobby.teams;
			this.name = lobby.options.name;
			mysqlPool.getConnection((err, connection) => {
				connection.beginTransaction((err) => {
					if (err) {
						callback(err);
						return;
					}
					var sqlCalls = [
						this.MYSQLTRANSACTIONcreateGame.bind(this, lobby.options.name, movementLimit, timeLimitInSeconds),
						this.MYSQLTRANSACTIONcreateTeams.bind(this),
						this.MYSQLTRANSACTIONcreateBindings.bind(this, fieldBindings),
					];

					var sqlCallsIndex = 0;
					// to avoid bulding a pyramid of indentation we instead define all our 
					function nextSQLcall(err, data) {
						if (err) {
							// if a query fails then rollback everything
							connection.rollback(() => {
								connection.release();
							})
							callback(err);
						} else {
							var sqlCall = sqlCalls[sqlCallsIndex];
							// increment the index so the next time this is called we get the next sqlCall
							sqlCallsIndex++;

							if (sqlCall) {
								// call the next sqlCall in the queue 
								sqlCall(connection, data, nextSQLcall);
							} else {
								// if there is nothing more to be run then commit the changes
								connection.commit((err) => {
									if (err) {
										// error occured while committing changes
										connection.rollback(() => {
											connection.release();
										})
										callback(err);
									} else {
										// everything commited successfully
										connection.release();
										callback(null, data);
									}
								});
							}
						}
					}
					nextSQLcall(null, {});
				})
			})
		},

		/**
		 * creates the game and adds the gameId to the data object 
		 * takes a mysql transaction, which means it will not clean up after itself. 
		 * it is meant to be called from the "newFieldBindings" function
		 * 
		 * @param {String} lobbyName 
		 * @param {number} movementLimit 
		 * @param {number} timeLimitInSeconds 
		 * @param {MysqlConnection} connection 
		 * @param {{}} data 
		 * @param {function} callback 
		 * @assign data.gameId
		 */
		MYSQLTRANSACTIONcreateGame: function(lobbyName, movementLimit, timeLimitInSeconds, connection, data, callback) {
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
		},

		/**
		 * create the teams in mysql
		 * takes a mysql transaction, which means it will not clean up after itself. 
		 * it is meant to be called from the "newFieldBindings" function
		 * 
		 * @param {MysqlConnection} connection 
		 * @param {{gameId: number}} data 
		 * @param {function} callback 
		 */
		MYSQLTRANSACTIONcreateTeams: function(connection, data, callback) {
			var teamsInserted = {
				createGroups: [],
				groupUsers: [],
				groupGames: [],
			};
			
			var teamCount = 0;
			for (var key in this.teams) {
				var team = this.teams[key];
				teamsInserted.createGroups.push([team.options.name, team.options.color]);
				teamCount ++;
			}

			connection.query("INSERT INTO groups(name, color) VALUES ?",
				[teamsInserted.createGroups],
				(err, result) => {
					if (err) {
						callback(err);
						return;
					}

					// start the index at one because if we have one enrtry then 9(insert id) - 1(teamCount) + 1(teamIndex) which would give 9 and that is the number that we need 
					var teamIndex = 1;
					for (var key in this.teams) {
						var team = this.teams[key];
						// because the the insertId is only the last inserted row and we then subtract the total amount of rows to get the first row id. thereafter we add the current index to get the current id again
						var groupID = result.insertId - teamCount + teamIndex;
						team.options.id = groupID;
						teamIndex++;
						// teamsInserted.createGroups.push([team.options.name, team.options.color]);
						for (var index = 0; index < team.users.length; index++) {
							var user = team.users[index];
							teamsInserted.groupUsers.push([groupID, user.id]);
							// data contains the game id
							teamsInserted.groupGames.push([groupID, data.gameId]);
						}
					}

					connection.query("INSERT INTO group_users(group_id, user_id) VALUES ?",
					[teamsInserted.groupUsers],
					(err, result) => {
						if (err) {
							callback(err)
							return;
						}
						connection.query("INSERT INTO game_groups(group_id, game_id) VALUES ?",
						[teamsInserted.groupGames],
						(err, result) => {
							if (err) {
								callback(err);
								return;
							}
							callback(null, data);
						});
					})
			});
		},

		/**
		 * Create bindings
		 * 
		 * @param {[{categoryId: , difficulty: number, boardGroupId: number},...]} fieldBindings 
		 * @param {MysqlConnection} connection 
		 * @param {{gameId: number}} data 
		 * @param {function} callback 
		 */
		MYSQLTRANSACTIONcreateBindings: function(fieldBindings, connection, data, callback) {
			var preparedValues = [];

			for (var index = 0; index < fieldBindings.length; index++) {
				var fieldBinding = fieldBindings[index];
				// the weight is a always 1 for now.
				preparedValues.push([data.gameId, fieldBinding.boardGroupId, fieldBinding.categoryId, fieldBinding.difficulty , 1]);
			}

			connection.query("INSERT INTO board_bindings(`game_id`, `board_group_id`, `question_category_id`, `difficulty`, `influence`) VALUES ?",
			[preparedValues],
			function(err, result){
				if (err) {
					callback(err);
				} else {
					callback(null, data);
				}
			});
		},

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