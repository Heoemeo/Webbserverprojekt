import { Response } from "express"
import { Log } from "../mongo"
import { AuthRequest } from "../middleware/authMiddleware"

// Hämta bara loggar för den inloggade användaren
export const getLogs = async (req: AuthRequest, res: Response) => {
    try {
        // Om ingen userId finns i tokenen
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        // Hämtar bara loggar för rätt användare
        const logs = await Log.find({ user_id: req.userId }).sort({ date: -1 })

        res.json(logs)
    } catch (error) {
        console.error("Error fetching logs:", error)
        res.status(500).json({ message: "Could not fetch logs" })
    }
}

// Skapa ny logg kopplad till inloggad användare
export const createLog = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { habit_id, date, completed } = req.body

        // Enkel validering
        if (!habit_id) {
            return res.status(400).json({ message: "habit_id is required" })
        }

        // Skapar loggen och sätter user_id från token
        const log = await Log.create({
            user_id: req.userId,
            habit_id,
            date: date || new Date(),
            completed: completed ?? true
        })

        res.status(201).json({
            message: "Habit logged successfully",
            log
        })
    } catch (error) {
        console.error("Error creating log:", error)
        res.status(500).json({ message: "Could not create log" })
    }
}

// Uppdatera logg
export const updateLog = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { id } = req.params

        // Uppdaterar bara logg som tillhör rätt användare
        const log = await Log.findOneAndUpdate(
            { _id: id, user_id: req.userId },
            req.body,
            { new: true }
        )

        if (!log) {
            return res.status(404).json({ message: "Log not found" })
        }

        res.json(log)
    } catch (error) {
        console.error("Error updating log:", error)
        res.status(500).json({ message: "Could not update log" })
    }
}

// Ta bort logg
export const deleteLog = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { id } = req.params

        // Tar bara bort logg som tillhör rätt användare
        const deleted = await Log.findOneAndDelete({
            _id: id,
            user_id: req.userId
        })

        if (!deleted) {
            return res.status(404).json({ message: "Log not found" })
        }

        res.json({ message: "The log was deleted" })
    } catch (error) {
        console.error("Error deleting log:", error)
        res.status(500).json({ message: "Could not delete log" })
    }
}
// Tar bort alla loggar för en viss habit som tillhör inloggad användare
export const deleteLogsByHabitId = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { habitId } = req.params

        await Log.deleteMany({
            user_id: req.userId,
            habit_id: Number(habitId)
        })

        res.json({ message: "All logs for the habit were deleted" })
    } catch (error) {
        console.error("Error deleting logs by habit id:", error)
        res.status(500).json({ message: "Could not delete logs for habit" })
    }
}
