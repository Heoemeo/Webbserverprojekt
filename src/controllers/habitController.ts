import { Request, Response } from "express"
import { db } from "../mysql"

export const getHabits = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query("SELECT * FROM habits")
        res.json(rows)
    } catch (error) {
        console.error("Error fetching habits:", error)
        res.status(500).json({ message: "Could not fetch habits" })
    }
}

export const createHabit = async (req: Request, res: Response) => {
    try {
        const { user_id, frequency_id, title, description, is_active } = req.body

        if (!user_id || !frequency_id || !title) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const [users]: any = await db.query("SELECT id FROM users WHERE id = ?", [user_id])
        if (users.length === 0) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const [frequencies]: any = await db.query("SELECT id FROM frequencies WHERE id = ?", [frequency_id])
        if (frequencies.length === 0) {
            return res.status(400).json({ message: "Frequency does not exist" })
        }

        await db.query(
            `INSERT INTO habits
            (user_id, frequency_id, title, description, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [user_id, frequency_id, title, description, is_active]
        )

        res.status(201).json({ message: "Habit created" })
    } catch (error) {
        console.error("Error creating habit:", error)
        res.status(500).json({ message: "Could not create habit" })
    }
}
export const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { title, description } = req.body

        await db.query(
            "UPDATE habits SET title=?, description=? WHERE id=?",
            [title, description, id]
        )

        res.json({ message: "Habit updated" })
    } catch (error) {
        console.error("Error updating habit:", error)
        res.status(500).json({ message: "Could not update habit" })
    }
}

export const deleteHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await db.query("DELETE FROM habits WHERE id=?", [id])
        res.json({ message: "The habit was deleted" })
    } catch (error) {
        console.error("Error deleting habit:", error)
        res.status(500).json({ message: "Could not delete habit" })
    }
}
