import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthcheck from './routes/healthcheck.js'
import { createServer } from "http"
import { Server } from "socket.io"
import { analyse_bonus_score, analyse_standard_score } from './farkle.js'

dotenv.config()
const PORT = process.env.PORT || 8080
const app = express()

app.use(express.json())
app.use(cors({
	origin: '*',
	// options: 'GET,POST,PATCH,DELETE',
	// allowedHeaders: 'Content-type,Authorization,token',
	// credentials: true
}))

//routes
app.use("/healthcheck", healthcheck)

const httpServer = createServer(app)
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
	}
})

let dice = [];
let score = 0;

function rollDice(holdDice) {
	// Lancer les dés non sélectionnés
	const newDice = holdDice.map((i) => dice[i]);
	while (newDice.length < 6) {
	  newDice.push(Math.floor(Math.random() * 6) + 1);
	}
  
	// Ajouter les dés sélectionnés aux dés à lancer
	const newHoldDice = holdDice.map((i) => dice[i]);
	const diceValues = newDice.concat(newHoldDice);
  
	// Calculer le score
	let newScore = score;
	const newRollScore = calculateScore(diceValues);
	if (newRollScore === 0) {
	  // Aucun point marqué lors de ce lancer
	  newScore = 0;
	} else if (newScore === 0) {
	  // Premier lancer avec des points marqués
	  newScore = newRollScore;
	} else {
	  // Ajouter les points marqués au score existant
	  newScore += newRollScore;
	}
  
	// Envoyer les nouvelles valeurs de dés et de score à tous les clients
	dice = newDice;
	score = newScore;
	io.emit("dice", dice);
	io.emit("score", score);
	io.emit("can-roll", true);
  }
  

function bankScore() {
  // Ajouter le score actuel au total
  // Réinitialiser les dés et le score
  score = 0;
  dice = [];
  io.emit("dice", dice);
  io.emit("score", score);
  io.emit("can-roll", true);
};

function calculateScore(diceValues) {
	const countDice = (diceValue) => diceValues.filter((d) => d === diceValue).length;
  
	let score = 0;
  
	// Calcul des scores des combinaisons de dés
	const counts = diceValues.map(countDice);
	for (let i = 0; i < counts.length; i++) {
	  if (counts[i] >= 3) {
		// Trois dés identiques valent 100 fois leur valeur, sauf pour le 1 qui vaut 1000
		const value = (i + 1 === 1) ? 1000 : (i + 1) * 100;
		score += value;
		counts[i] -= 3;
	  }
	}
	// Ajout du score pour les dés restants
	score += counts[0] * 100; // Les 1 valent 100 chacun
	score += counts[4] * 50; // Les 5 valent 50 chacun
  
	return score;
  }
  



io.on("connection", (socket) => {
	console.log("Client connected");
  
	socket.on("roll-dice", (holdDice) => {
	  rollDice(holdDice);
	  io.emit("can-roll", false)
	});

	socket.on("bank-score", () => {
	bankScore();
	});
	
	socket.on("disconnect", () => {
	console.log("Client disconnected");
	});
	
	// Envoyer les valeurs initiales de dés et de score au client lorsqu'il se connecte
	io.to(socket.id).emit("dice", dice);
	io.to(socket.id).emit("score", score);
	io.to(socket.id).emit("can-roll", true);
	});

httpServer.listen(8080, () => console.log("Server is running on port 8080"))

export default app