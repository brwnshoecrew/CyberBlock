const mysql_queries = require("./mysql_queries");

module.exports = {
	handleEvents: function (socket, app, io, db_connection) {
		socket.on(
			"host_create_lobby",
			(
				{
					nbOfTeams,
					nbOfRounds,
					nbOfDefenses,
					timeForEachRound,
					userEarnings,
					hasTriviaRound,
					difficulty,
				},
				ack
			) => {
				const lobbyId = Math.ceil(Math.random() * 10000).toString();

				//initialize lobby
				app.locals[lobbyId] = {};
				app.locals[lobbyId].hostId = socket.id;
				app.locals[lobbyId].previousTriviaQuestionIds = [];
				app.locals[lobbyId].submittedTriviaAnswers = Array(parseInt(nbOfTeams)).fill(null);
				app.locals[lobbyId].scores = Array(parseInt(nbOfTeams)).fill(0);

				//store lobby configuration info
				app.locals[lobbyId].nbOfTeams = nbOfTeams;
				app.locals[lobbyId].nbOfRounds = nbOfRounds;
				app.locals[lobbyId].nbOfDefenses = nbOfDefenses;
				app.locals[lobbyId].timeForEachRound = timeForEachRound;
				app.locals[lobbyId].userEarnings = userEarnings;
				app.locals[lobbyId].hasTriviaRound = hasTriviaRound;
				app.locals[lobbyId].difficulty = difficulty;

				//initialize team arrays
				app.locals[lobbyId].teamInfo = [];
				app.locals[lobbyId].boughtDefenses = [];
				app.locals[lobbyId].playedDefenses = [];
				for (i = 0; i < nbOfTeams; i++) {
					app.locals[lobbyId].teamInfo.push([]);
					app.locals[lobbyId].boughtDefenses.push([]);
					app.locals[lobbyId].playedDefenses.push([]);
				}

				//join host to lobby
				socket.join(lobbyId);
				console.log(`Host with socketID ${socket.id} joined lobby ${lobbyId}`);
				//ack with lobbyId
				ack(lobbyId);
			}
		);

		socket.on("student_join_lobby", ({ lobbyId, alias }, ack) => {
			//add student to a team with least members
			let nbOfMembers = 9999;
			let teamWithLeastMembers = null;
			for (i = app.locals[lobbyId].nbOfTeams - 1; i >= 0; i--) {
				if (app.locals[lobbyId].teamInfo[i].length <= nbOfMembers) {
					nbOfMembers = app.locals[lobbyId].teamInfo[i].length;
					teamWithLeastMembers = i;
				}
			}
			app.locals[lobbyId].teamInfo[teamWithLeastMembers].push({
				socketId: socket.id,
				alias: alias,
			});

			//add student to lobby
			socket.join(lobbyId);
			console.log(`Student with socketId ${socket.id} joined lobby ${lobbyId}`);

			//emit to members already in the room with updated teamInfo
			io.in(lobbyId).emit(
				"new_student_joined_lobby",
				app.locals[lobbyId].teamInfo
			);

			//ack to newly joined student, with configuration and teamInfo
			ack({
				nbOfTeams: app.locals[lobbyId].nbOfTeams,
				nbOfRounds: app.locals[lobbyId].nbOfRounds,
				nbOfDefenses: app.locals[lobbyId].nbOfDefenses,
				timeForEachRound: app.locals[lobbyId].timeForEachRound,
				userEarnings: app.locals[lobbyId].userEarnings,
				hasTriviaRound: app.locals[lobbyId].hasTriviaRound,
				difficulty: app.locals[lobbyId].difficulty,
				teamInfo: app.locals[lobbyId].teamInfo,
			});
		});

		socket.on(
			"host_move_student",
			({ lobbyId, socketId, oldTeamId, newTeamId }) => {
				const oldTeam = app.locals[lobbyId].teamInfo[oldTeamId];
				const newTeam = app.locals[lobbyId].teamInfo[newTeamId];
				let alias = null;
				//remove student from old team
				oldTeam.forEach((item, index) => {
					if (item.socketId === socketId) {
						alias = item.alias;
						oldTeam.splice(index, 1);
					}
				});
				//add student to new team
				newTeam.push({ socketId: socketId, alias: alias });

				//emit updated teamInfo to lobby
				io.in(lobbyId).emit(
					"host_moved_student",
					app.locals[lobbyId].teamInfo
				);
			}
		);

		socket.on("host_start_game", (lobbyId) => {
			//add each team member to their team socket room for chat
			app.locals[lobbyId].teamInfo.forEach((item, index) => {
				item.forEach((item) => {
					app.locals.sockets.get(item.socketId).join(lobbyId + "_team" + index);
				});
			});
			//emit event so front end knows game has been started when they receive this event
			io.in(lobbyId).emit("host_started_game", app.locals[lobbyId].hasTriviaRound);
		});

		socket.on("host_gets_trivia_question", async (lobbyId, ack) => {
			//to ensure we don't get duplicates and we don't query the database 10 times for a trivia question
			const numberOfTriviaQuestions =
				await mysql_queries.getNumberOfTriviaQuestions(db_connection);

			let newTriviaId;
			do {
				newTriviaId =
					Math.floor(Math.random() * numberOfTriviaQuestions.Count) + 1;
				newTriviaId = "300" + newTriviaId;
			} while (
				app.locals[lobbyId].previousTriviaQuestionIds.includes(newTriviaId)
			);

			const triviaQuestion = await mysql_queries.getTriviaQuestion(
				db_connection,
				newTriviaId
			);
			app.locals[lobbyId].previousTriviaQuestionIds.push(newTriviaId);

			app.locals[lobbyId].triviaQuestionAnswer = triviaQuestion.Answer;
			app.locals[lobbyId].submittedTriviaAnswers = [];

			io.in(lobbyId).emit("student_receives_trivia_question", triviaQuestion);
			ack(triviaQuestion);
		});

		socket.on("student_submit_trivia_answer", ({ lobbyId, teamId, triviaAnswer }, ack) => {
			const triviaReward = 5;

			app.locals[lobbyId].submittedTriviaAnswers[teamId] = triviaAnswer;
			io.in(lobbyId).emit("student_submitted_trivia_answer", app.locals[lobbyId].submittedTriviaAnswers);

			if (triviaAnswer === app.locals[lobbyId].triviaQuestionAnswer) {
				ack({
					triviaReward: triviaReward,
				});
			} else {
				ack({
					triviaReward: 0,
				});
			}
		}
		);

		socket.on("host_ends_trivia_round", lobbyId => {
			io.in(lobbyId).emit("host_ended_trivia_round");
		})

		socket.on("host_start_buy_phase", async (lobbyId) => {
			const defenses = await mysql_queries.getDefenses(
				db_connection,
				app.locals[lobbyId].difficulty
			);
			io.in(lobbyId).emit("student_receive_defenses", defenses);
		});

		socket.on("student_buy_defenses", ({ lobbyId, teamId, defenses }) => {
			app.locals[lobbyId].boughtDefenses[teamId] = defenses;
			io.in(lobbyId).emit("student_bought_defenses", app.locals[lobbyId].boughtDefenses);
		})

		socket.on("host_start_next_defense_round", async (lobbyId) => {
			//clear old data
			app.locals[lobbyId].playedDefenses = Array(parseInt(app.locals[lobbyId].nbOfTeams)).fill([]);

			const attack = await mysql_queries.getAttack(db_connection, app.locals[lobbyId].difficulty);
			io.in(lobbyId).emit("student_receive_attack", ({ attack: attack, playedDefenses: app.locals[lobbyId].playedDefenses }));
		});

		socket.on("student_play_defenses", async ({ lobbyId, teamId, defenses, attackId }) => {
			app.locals[lobbyId].playedDefenses[teamId] = defenses;
			const bestDefenses = await mysql_queries.getBestDefenses(db_connection, attackId);

			for (const defense of defenses) {
				let pointRewarded = await mysql_queries.getPoints(db_connection, defense.defenseID, attackId);
				if (pointRewarded.length !== 0) {
					app.locals[lobbyId].scores[teamId] += await parseInt(pointRewarded[0].PointValue);
				}
			}
			console.log("scores", app.locals[lobbyId].scores);
			io.in(lobbyId).emit("student_played_defenses", ({ scores: app.locals[lobbyId].scores, bestDefenses: bestDefenses, playedDefenses: app.locals[lobbyId].playedDefenses }));
		});

		socket.on("host_end_game", lobbyId => {
			io.in(lobbyId).emit("host_ended_game");
			app.locals[lobbyId] = {};
		})

		socket.on("chat_sendToAll", ({ lobbyId, alias, message }) => {
			io.in(lobbyId).emit("chat_receiveFromAll", {
				alias: alias,
				message: message,
			});
		});

		socket.on("chat_sendToTeam", ({ lobbyId, alias, teamId, message }) => {
			io.in(lobbyId + `_team` + teamId).emit("chat_receiveFromTeam", {
				alias: alias,
				message: message,
			});
		});
	}
};
