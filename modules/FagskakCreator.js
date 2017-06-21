module.exports = function(mysqlPool) {


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
	function MYSQLTRANSACTIONcreateGame(lobbyName, movementLimit, timeLimitInSeconds, connection, data, callback) {
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
	}

	/**
	 * create the teams in mysql
	 * takes a mysql transaction, which means it will not clean up after itself. 
	 * it is meant to be called from the "newFieldBindings" function
	 * 
	 * @param {MysqlConnection} connection 
	 * @param {{gameId: number}} data 
	 * @param {function} callback 
	 */
	function MYSQLTRANSACTIONcreateTeams(teams, connection, data, callback) {
		var teamsInserted = {
			createGroups: [],
			groupUsers: [],
			groupGames: [],
		};
		
		var teamCount = 0;
		for (var key in teams) {
			var team = teams[key];
			teamsInserted.createGroups.push([
				team.options.name,
				team.options.color,
				// if the team is playable then it is not a spectator
				team.options.playable ? 0 : 1]);
			teamCount ++;
		}

		connection.query("INSERT INTO groups(name, color, is_spectator) VALUES ?",
			[teamsInserted.createGroups],
			(err, result) => {
				if (err) {
					callback(err);
					return;
				}

				// start the index at one because if we have one enrtry then 9(insert id) - 1(teamCount) + 1(teamIndex) which would give 9 and that is the number that we need 
				var teamIndex = 1;
				for (var key in teams) {
					var team = teams[key];
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
	}

	/**
	 * Create bindings
	 * 
	 * @param {[{categoryId: , difficulty: number, boardGroupId: number},...]} fieldBindings 
	 * @param {MysqlConnection} connection 
	 * @param {{gameId: number}} data 
	 * @param {function} callback 
	 */
	function MYSQLTRANSACTIONcreateBindings(fieldBindings, connection, data, callback) {
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
	}

	/**
	 * Creates new mysql entries
	 * 
	 * @param {[{category: {color: string, name: string, id: number}, fields: }, difficulty: number, fieldsId: number]} fieldBindings
	 * @param {Lobby} lobby
	 * @param {number} movementLimit
	 * @param {number} timeLimitInSeconds
	 * @param {function} callback
	 */
	return function createFagskakGame(fieldBindings, lobby, movementLimit, timeLimitInSeconds, callback) {
		mysqlPool.getConnection((err, connection) => {
			connection.beginTransaction((err) => {
				if (err) {
					callback(err);
					return;
				}
				var sqlCalls = [
					MYSQLTRANSACTIONcreateGame.bind(this, lobby.options.name, movementLimit, timeLimitInSeconds),
					MYSQLTRANSACTIONcreateTeams.bind(this, lobby.teams),
					MYSQLTRANSACTIONcreateBindings.bind(this, fieldBindings),
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
	}
}