import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config()

const PORT = process.env.PORT || 80
const app = express()

app.use(express.json())
app.use(cors({
	origin: '*',
	options: 'GET,POST,PATCH,DELETE',
	allowedHeaders: 'Content-type,Authorization,token',
	credentials: true
}))

app.listen(PORT, () => console.log(`Server listening on port : ${PORT}`))

export default app