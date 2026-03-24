import express from "express" // Importerar Express (webbserver)
import cors from "cors" // Tillåter requests från andra origins (t.ex. frontend)
import dotenv from "dotenv" // Läser in variabler från .env-fil

// Laddar miljövariabler (t.ex. PORT, DB, MONGO_URI)
dotenv.config()

// Routes för habits (MySQL)
// Routes för logs (MongoDB)
// Funktion som kopplar till MongoDB
import habitRoutes from "./routes/habitRoutes"
import logRoutes from "./routes/logRoutes"
import { connectMongo } from "./mongo"

// Skapar Express-app (server)
// Hämtar port från .env eller använder 3000
const app = express()
const PORT = Number(process.env.PORT || 3000)

// Gör så att servern kan läsa JSON i request body
// Tillåter frontend att prata med backend
app.use(express.json())
app.use(cors())

// Gör så att statiska filer (HTML, CSS, JS) kan nås via webbläsaren
// T.ex. http://localhost:3000/habits.html
app.use(express.static("sidor"))

// Kopplar routes till /api
// Ex: /api/habits, /api/logs
app.use("/api", habitRoutes)
app.use("/api", logRoutes)

// Startar anslutning till MongoDB (Atlas)
connectMongo()

// Startar servern och lyssnar på vald port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
