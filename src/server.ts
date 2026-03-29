import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './config/db'
import authRoutes from './routes/authRoutes'
dotenv.config()

//import routes
import habitRoutes from './routes/habitRoutes'
import logRoutes from './routes/logRoutes'

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(express.json())

//enable cors so the frontend can talk to backend
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

//connect routes to api
app.use('/api/auth', authRoutes)

app.use('/api', habitRoutes)

app.use('/api', logRoutes)

sequelize.sync({ alter: true }).then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'))
})
