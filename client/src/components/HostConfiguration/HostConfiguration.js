import * as React from "react";
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Input,
	Typography,
	TextField,
} from "@material-ui/core";
import { useState, useContext } from "react";
import { Context } from "../../context/ContextProvider";

// page to allow the host to add configurations to the game
const HostConfiguration = ({ children }) => {
	// shared states
	const {
		setGameStage,
		setNbOfTeams, setNbOfRounds, setTimeForEachRound, setUserEarnings,
		hasTriviaRound, setHasTriviaRound, difficulty, setDifficulty,
		host_create_lobby
	} = useContext(Context);

	const formControlBox = {
		p: 6,
		border: "1px solid black",
		borderRadius: "20px",
		align: "center",
		alignItems: "center",
		position: "absolute",
		minWidth: 500,
		maxWidth: 700,
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		display: "flex",
		flexDirection: "column"
	};
	// handles the submission of the configuration by calling the create lobby event
	const handleOnClick = () => {
		//changes to the next interface
		setGameStage('WAITING');
		host_create_lobby();
	};

	return (
		<Box sx={formControlBox} boxShadow={3}>
			<Typography variant="h5">Create New Lobby</Typography>
			<br></br>
			<TextField
				margin="normal"
				required
				fullWidth
				label="Number of teams"
				autoFocus
				onChange={(event) => setNbOfTeams(event.target.value)}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				label="Number of Rounds"
				onChange={(event) => setNbOfRounds(event.target.value)}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				label="Round Duration (in seconds)"
				onChange={(event) => setTimeForEachRound(event.target.value)}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				label="Amount of Starting Money"
				onChange={(event) => setUserEarnings(event.target.value)}
			/>
			<br></br>
			<FormControl fullWidth>
				<InputLabel id="select-difficulty-label">Difficulty</InputLabel>
				<Select
					labelId="select-difficulty-label"
					id="select-difficulty"
					value={difficulty}
					label="Difficulty"
					onChange={(event) => setDifficulty(event.target.value)}
				>
					<MenuItem value={1}>Beginner</MenuItem>
					<MenuItem value={2}>Intermediate</MenuItem>
					<MenuItem value={3}>Expert</MenuItem>
				</Select>
			</FormControl>
			<br/>
			<FormControl fullWidth>
				<InputLabel id="select-label-hasTriviaRound">Play Trivia Rounds?</InputLabel>
				<Select
					labelId="select-label-hasTriviaRound"
					id="select-hasTrivia"
					value={hasTriviaRound}
					label="hasTrivia"
					onChange={(event) => setHasTriviaRound(event.target.value)}
				>
					<MenuItem value={true}>Yes</MenuItem>
					<MenuItem value={false}>No</MenuItem>
				</Select>
			</FormControl>
			<br></br>
			<br></br>
			<Button
				variant="contained"
				fullWidth
				onClick={handleOnClick}
			>
				Create The Lobby
			</Button>
		</Box>
	);
};

export default HostConfiguration;
