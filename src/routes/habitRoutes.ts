import  Express  from "express"

//import controller functions
import{
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit
} from"../controllers/habitController"

const router = Express.Router()

//get
router.get("/habits", getHabits)

//post
router.post("/habits", createHabit)

//put
router.put("/habits/:id", updateHabit)

//delete
router.delete("/habits/:id", deleteHabit)

export default router
