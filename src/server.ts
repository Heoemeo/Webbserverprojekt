import "dotenv/config"
import express from "express"
import cors from "cors"

import habitRoutes from "./routes/habitRoutes"
import logRoutes from "./routes/logRoutes"
import { connectMongo } from "./mongo"

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(express.json())
app.use(cors())

app.use(express.static("sidor"))

app.use("/api", habitRoutes)
app.use("/api", logRoutes)

connectMongo()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
