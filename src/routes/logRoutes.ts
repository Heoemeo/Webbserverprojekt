import  express  from "express"

//import mongo db functions
import {
    getLogs,
    createLog,
    updateLog,
    deleteLog
} from "../controllers/logController"

const router = express.Router()

//get
router.get("/logs",getLogs)

//post
router.post("/logs", createLog)

//put
router.put("/logs/:id", updateLog)

//delete
router.delete("/logs/:id", deleteLog)

export default router
