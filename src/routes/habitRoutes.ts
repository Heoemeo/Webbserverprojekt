import Express from "express"

// Importerar controller-funktioner
import {
    getHabits,
    getHabitMeta,
    createHabit,
    updateHabit,
    deleteHabit
} from "../controllers/habitController"

const router = Express.Router()

// Hämtar metadata för habits, t.ex. categories och frequencies
router.get("/habits/meta", getHabitMeta)

// Hämtar alla habits
router.get("/habits", getHabits)

// Skapar en ny habit
router.post("/habits", createHabit)

// Uppdaterar en habit
router.put("/habits/:id", updateHabit)

// Tar bort en habit
router.delete("/habits/:id", deleteHabit)

export default router
