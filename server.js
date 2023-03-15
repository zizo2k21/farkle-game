import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthcheck from './routes/healthcheck.js'
import { createServer } from "http"
import { Server } from "socket.io"

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

io.on("connection", (socket) => {
	// console.log(socket.id)
})
io.on("ok", (socket) => {
	console.log(socket.id)
})

httpServer.listen(8080, () => console.log("Server is running on port 8080"))

export default app