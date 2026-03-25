import { Request, Response } from "express"
import { db } from "../mysql"

export const getHabits = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query("SELECT * FROM habits ORDER BY id DESC")
        res.json(rows)
    } catch (error) {
        console.error("Error fetching habits:", error)
        res.status(500).json({ message: "Could not fetch habits" })
    }
}

export const createHabit = async (req: Request, res: Response) => {
    try {
        let { user_id, frequency_id, title, description, is_active } = req.body

        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ message: "Title is required" })
        }

        if (!user_id) {
            const [users]: any = await db.query(
                "SELECT id FROM users ORDER BY id ASC LIMIT 1"
            )

            if (users.length === 0) {
                return res.status(500).json({
                    message: "No users found in database"
                })
            }

            user_id = users[0].id
        }

        if (!frequency_id) {
            const [frequencies]: any = await db.query(
                "SELECT id FROM frequencies ORDER BY id ASC LIMIT 1"
            )

            if (frequencies.length === 0) {
                return res.status(500).json({
                    message: "No frequencies found in database"
                })
            }

            frequency_id = frequencies[0].id
        }

        await db.query(
            `INSERT INTO habits (user_id, frequency_id, title, description, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                user_id,
                frequency_id,
                title.trim(),
                description?.trim() || null,
                is_active ?? true
            ]
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
            "UPDATE habits SET title = ?, description = ? WHERE id = ?",
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

        await db.query("DELETE FROM habits WHERE id = ?", [id])

        res.json({ message: "The habit was deleted" })
    } catch (error: any) {
        console.error("Error deleting habit:", error)

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                message: "Cannot delete habit because it is linked to other data"
            })
        }

        res.status(500).json({ message: "Could not delete habit" })
    }
}
