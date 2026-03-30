import express from "express"

import {
    getLogs,
    createLog,
    updateLog,
    deleteLog,
    deleteLogsByHabitId
} from "../controllers/logController"

import { authenticateToken } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/logs", authenticateToken, getLogs)
router.post("/logs", authenticateToken, createLog)
router.put("/logs/:id", authenticateToken, updateLog)
router.delete("/logs/:id", authenticateToken, deleteLog)
router.delete("/logs/habit/:habitId", authenticateToken, deleteLogsByHabitId)

export default router
