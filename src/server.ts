import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

// Importerar databaskoppling och routes
import sequelize from './config/db'
import authRoutes from './routes/authRoutes'
import habitRoutes from './routes/habitRoutes'
import logRoutes from './routes/logRoutes'
import { connectMongo } from './mongo'
import './models/user'

// Läser .env fil
dotenv.config()

const app = express()

// Port (standard 3000 om inget annat finns i .env)
const PORT = Number(process.env.PORT || 3000)

// Gör så att servern kan läsa JSON i requests
app.use(express.json())

// Tillåter frontend att prata med backend (CORS)
app.use(
    cors({
        origin: '*', // tillåter alla origins (bra för utveckling)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

// 🔥 Detta är viktigt!
// Gör så att Express serverar dina HTML-filer (frontend)
app.use(express.static(path.join(__dirname, "../sidor")))

// Routes (API endpoints)
app.use('/api/auth', authRoutes)
app.use('/api', habitRoutes)
app.use('/api', logRoutes)

async function startServer() {
    try {
        await sequelize.authenticate()
        console.log('MySQL connected')

        await sequelize.sync()
        console.log('MySQL synced')

        await connectMongo()

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    } catch (error) {
        console.error('Error starting server:', error)
    }
}

startServer()
