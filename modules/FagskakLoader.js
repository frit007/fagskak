var Team = require('./Team.js');

module.exports = function(mysqlPool, users, questions) {
	var BoardBinding = require('./BoardBinding.js')(mysqlPool);
	var Fagskak = require('./Fagskak.js')(mysqlPool, questions, users);

	/**
	 * 
	 */
	return function (gameId, gameOptions, callback) {
		mysqlPool.query("SELECT * FROM games where id = ?", [gameId], function(err, games) {
			if (err) {
				callback(err);
			}
			if (games.length !== 1) {
				callback("Unable to find game with id: " + gameId);
			}
			var game = games[0];
			mysqlPool.query(
				"select u.id as user_id, u.display_name as display_name, gr.name as group_name, gr.id as group_id, gr.color as group_color, gr.is_spectator from users as u "+
				"join group_users as gu on u.id = gu.user_id and gu.has_left_group = 0 "+
				"join groups as gr on gr.id = gu.group_id "+
				"join game_groups as gg on gg.group_id = gr.id "+
				"join games as g on g.id = gg.game_id "+
				"where g.id = ?",
				[game.id], function(err, userResults) {
					if (err) {
						callback(err);
						return;
					}
					console.log(game);
					console.log(users);

					var userIds = [];
					
					var teams = {};
					// var playingTeams = [];

					for (var index = 0; index < userResults.length; index++) {
						var userResult = userResults[index];
						userIds.push(userResult.user_id);
					}

					users.loadUsersIntoCache(userIds, function(err, users) {
						if (err) {
							callback(err);
							return;
						}
						console.log(users, teams, userIds);
						

						for (var index = 0; index < userResults.length; index++) {
							var userResult = userResults[index];
							var team;
							var key = userResult.is_spectator ? userResult.is_spectator : userResult.group_id;

							if (typeof teams[key] === "undefined") {
								team = new Team({
									name: userResult.group_name,
									id: userResult.group_id,
									playable: !userResult.is_spectator,
									color: userResult.group_color,
								});
								teams[key] = team;
								// if(!team.is_spectator) {
								// 	playingTeams.push(team);
								// }
							} else {
								team = teams[key];
							}
							var user = users[userResult.user_id];
							team.addUser(user);
						}

						mysqlPool.query(
							"select bb.id as board_binding_id, \n"+
							"qc.id as category_id, \n"+
							"qc.color as color, \n"+
							"qc.name as category_name, \n"+
							"bg.id as board_group_id, \n"+
							"bg.name as board_group_name, \n"+
							"bf.x, \n"+
							"bf.z, \n"+
							"bb.influence, \n"+
							"bb.difficulty from board_bindings as bb  \n"+
							"join question_categories as qc on qc.id = bb.question_category_id \n"+
							"join board_groups as bg on bg.id = bb.board_group_id \n"+
							"join board_field_groups as bfg on bfg.board_group_id = bg.id \n"+
							"join board_fields as bf on bf.id = bfg.board_field_id \n"+
							"where bb.game_id = ?",
							[gameId], function(err, boardBindingResults) {
								if (err) {
									callback(err);
									return;
								}
								var boardBindings = {};

								for (var index = 0; index < boardBindingResults.length; index++) {
									var boardBindingResult = boardBindingResults[index];
									var BBR = boardBindingResult;
									boardBindingId = BBR.board_binding_id;

									if (typeof boardBindings[boardBindingId] === "undefined") {
										// if it does not yet exist create a board binding
										boardBindings[boardBindingId] = new BoardBinding([{
												// fields
												x: BBR.x,
												z: BBR.z
											}], {
												// categories
												color: BBR.color,
												id: BBR.category_id,
												name: BBR.category_name,
											}, {
												// options
												influence: BBR.influence,
												difficulty: BBR.difficulty,
												boardGroupName: BBR.board_group_name,
												id: BBR.board_binding_id,
											}
										);
									} else {
										// if it already exists then add field
										boardBindings[boardBindingId].addField({
											// field
											x: BBR.x,
											z: BBR.z
										});
									}
								}
								
								var game = new Fagskak(gameId, boardBindings, teams, gameOptions);

								callback(null, game);
							}
						)
					});
				})
			// mysqlPool.query("SELECT ")
		})

	}



}