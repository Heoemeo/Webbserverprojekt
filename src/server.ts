import  express  from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

//import routes
import habitRoutes from "./routes/habitRoutes"
import logRoutes from "./routes/logRoutes"

//creates express server
const app = express()

//middleware, allow server to read json data
app.use(express.json())

//enable cors so the frontend can talk to backend
app.use(cors())

//connect routes to api
app.use("/api", habitRoutes)

app.use("/api", logRoutes)

app.listen(3000, () =>{
    console.log("server running on port 3000")
})



//paket att ladda ner npm install express cors dotenv mysql2 sequelize mongoose bcrypt jsonwebtoken
//npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken nodemon
