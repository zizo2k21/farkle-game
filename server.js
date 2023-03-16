import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthcheck from './routes/healthcheck.js'
import { createServer } from "http"
import { Server } from "socket.io"
import { analyse_bonus_score, analyse_score, analyse_standard_score, roll_dice_set } from './farkle.js'

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

function rollDice(nb_dice_to_roll) {
	console.log(nb_dice_to_roll);
	dice = roll_dice_set(nb_dice_to_roll)
	console.log(dice);
	io.emit("dice", dice);
	
	score = analyse_score(dice);
	
	io.emit("score", score.score);
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


  



io.on("connection", (socket) => {
	console.log("Client connected");
  
	socket.on("roll-dice", (nbdicetoset) => {
	  rollDice(nbdicetoset);
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