import { Request, Response } from "express"
import { db } from "../mysql"

// Kontrollerar om en tabell finns i databasen
const tableExists = async (tableName: string) => {
    const [rows]: any = await db.query(`SHOW TABLES LIKE ?`, [tableName])
    return rows.length > 0
}

// Kontrollerar om en kolumn finns i en viss tabell
const columnExists = async (tableName: string, columnName: string) => {
    const [rows]: any = await db.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName])
    return rows.length > 0
}

// Försöker hitta rätt kolumnnamn för text/namn i en tabell
// Används om tabellen har name, title eller label
const getLabelColumn = async (tableName: string) => {
    const possibleColumns = ["name", "title", "label"]

    for (const column of possibleColumns) {
        if (await columnExists(tableName, column)) {
            return column
        }
    }

    return null
}

// Hämtar metadata till frontend
// Här skickas frequencies och categories till habits-sidan
export const getHabitMeta = async (_req: Request, res: Response) => {
    try {
        let frequencies: any[] = []
        let categories: any[] = []

        if (await tableExists("frequencies")) {
            const frequencyLabelColumn = await getLabelColumn("frequencies")

            if (frequencyLabelColumn) {
                const [rows]: any = await db.query(
                    `SELECT id, \`${frequencyLabelColumn}\` AS name FROM frequencies ORDER BY id ASC`
                )
                frequencies = rows
            }
        }

        if (await tableExists("categories")) {
            const categoryLabelColumn = await getLabelColumn("categories")

            if (categoryLabelColumn) {
                const [rows]: any = await db.query(
                    `SELECT id, \`${categoryLabelColumn}\` AS name FROM categories ORDER BY id ASC`
                )
                categories = rows
            }
        }

        res.json({ frequencies, categories })
    } catch (error) {
        console.error("Error fetching habit metadata:", error)
        res.status(500).json({ message: "Could not fetch habit metadata" })
    }
}

// Hämtar alla habits
// Hämtar även frequency och alla categories via habit_categories
export const getHabits = async (_req: Request, res: Response) => {
    try {
        const hasFrequencyTable = await tableExists("frequencies")
        const hasHabitCategoriesTable = await tableExists("habit_categories")
        const hasCategoriesTable = await tableExists("categories")

        const frequencyLabelColumn = hasFrequencyTable
            ? await getLabelColumn("frequencies")
            : null

        const categoryLabelColumn = hasCategoriesTable
            ? await getLabelColumn("categories")
            : null

        const selectParts = [
            "h.id",
            "h.user_id",
            "h.frequency_id",
            "h.title",
            "h.description",
            "h.is_active",
            "h.created_at"
        ]

        const joinParts: string[] = []
        const groupByParts = [
            "h.id",
            "h.user_id",
            "h.frequency_id",
            "h.title",
            "h.description",
            "h.is_active",
            "h.created_at"
        ]

        // Kopplar habits till frequencies om frequencies-tabellen finns
        if (hasFrequencyTable && frequencyLabelColumn) {
            selectParts.push(`f.\`${frequencyLabelColumn}\` AS frequency`)
            joinParts.push("LEFT JOIN frequencies f ON h.frequency_id = f.id")
            groupByParts.push(`f.\`${frequencyLabelColumn}\``)
        } else {
            selectParts.push("NULL AS frequency")
        }

        // Kopplar habits till habit_categories och categories
        // GROUP_CONCAT gör att flera categories visas som en kommaseparerad text
        if (hasHabitCategoriesTable && hasCategoriesTable && categoryLabelColumn) {
            selectParts.push(
                `GROUP_CONCAT(DISTINCT c.\`${categoryLabelColumn}\` ORDER BY c.\`${categoryLabelColumn}\` SEPARATOR ', ') AS categories`
            )
            joinParts.push("LEFT JOIN habit_categories hc ON h.id = hc.habit_id")
            joinParts.push("LEFT JOIN categories c ON hc.category_id = c.id")
        } else {
            selectParts.push("NULL AS categories")
        }

        const query = `
            SELECT ${selectParts.join(", ")}
            FROM habits h
            ${joinParts.join(" ")}
            GROUP BY ${groupByParts.join(", ")}
            ORDER BY h.id DESC
        `

        const [rows] = await db.query(query)
        res.json(rows)
    } catch (error) {
        console.error("Error fetching habits:", error)
        res.status(500).json({ message: "Could not fetch habits" })
    }
}

// Skapar en ny habit
// Sparar först habiten och sedan alla valda categories i habit_categories
export const createHabit = async (req: Request, res: Response) => {
    const connection = await db.getConnection()

    try {
        await connection.beginTransaction()

        let {
            user_id,
            frequency_id,
            title,
            description,
            is_active,
            category_ids
        } = req.body

        if (!title || typeof title !== "string" || title.trim() === "") {
            await connection.rollback()
            return res.status(400).json({ message: "Title is required" })
        }

        // Om user_id inte skickas med används första användaren i databasen
        if (!user_id) {
            const [users]: any = await connection.query(
                "SELECT id FROM users ORDER BY id ASC LIMIT 1"
            )

            if (users.length === 0) {
                await connection.rollback()
                return res.status(500).json({
                    message: "No users found in database"
                })
            }

            user_id = users[0].id
        }

        // Om frequency_id inte skickas med används första frequency i databasen
        if (!frequency_id) {
            const [frequencies]: any = await connection.query(
                "SELECT id FROM frequencies ORDER BY id ASC LIMIT 1"
            )

            if (frequencies.length === 0) {
                await connection.rollback()
                return res.status(500).json({
                    message: "No frequencies found in database"
                })
            }

            frequency_id = frequencies[0].id
        }

        // Skapar själva habiten först
        const [result]: any = await connection.query(
            `
            INSERT INTO habits (user_id, frequency_id, title, description, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                frequency_id,
                title.trim(),
                description?.trim() || null,
                is_active ?? true,
                new Date()
            ]
        )

        const habitId = result.insertId

        // Om categories skickas med sparas de i kopplingstabellen
        if (Array.isArray(category_ids) && category_ids.length > 0) {
            for (const categoryId of category_ids) {
                await connection.query(
                    `
                    INSERT INTO habit_categories (habit_id, category_id)
                    VALUES (?, ?)
                    `,
                    [habitId, categoryId]
                )
            }
        }

        await connection.commit()
        res.status(201).json({ message: "Habit created" })
    } catch (error) {
        await connection.rollback()
        console.error("Error creating habit:", error)
        res.status(500).json({ message: "Could not create habit" })
    } finally {
        connection.release()
    }
}

// Uppdaterar en habit
// Uppdaterar först habitens vanliga data och sedan categories i habit_categories
export const updateHabit = async (req: Request, res: Response) => {
    const connection = await db.getConnection()

    try {
        await connection.beginTransaction()

        const { id } = req.params
        const { title, description, frequency_id, category_ids } = req.body

        await connection.query(
            `
            UPDATE habits
            SET title = ?, description = ?, frequency_id = ?
            WHERE id = ?
            `,
            [title, description, frequency_id, id]
        )

        // Tar bort gamla category-kopplingar
        await connection.query(
            "DELETE FROM habit_categories WHERE habit_id = ?",
            [id]
        )

        // Lägger in nya category-kopplingar
        if (Array.isArray(category_ids) && category_ids.length > 0) {
            for (const categoryId of category_ids) {
                await connection.query(
                    `
                    INSERT INTO habit_categories (habit_id, category_id)
                    VALUES (?, ?)
                    `,
                    [id, categoryId]
                )
            }
        }

        await connection.commit()
        res.json({ message: "Habit updated" })
    } catch (error) {
        await connection.rollback()
        console.error("Error updating habit:", error)
        res.status(500).json({ message: "Could not update habit" })
    } finally {
        connection.release()
    }
}

// Tar bort en habit
export const deleteHabit = async (req: Request, res: Response) => {
    const connection = await db.getConnection()

    try {
        await connection.beginTransaction()

        const { id } = req.params

        // Tar bort kopplingar till categories först
        await connection.query(
            "DELETE FROM habit_categories WHERE habit_id = ?",
            [id]
        )

        // Tar bort själva habiten sist
        await connection.query(
            "DELETE FROM habits WHERE id = ?",
            [id]
        )

        await connection.commit()

        res.json({ message: "The habit was deleted" })
    } catch (error) {
        await connection.rollback()
        console.error("Error deleting habit:", error)
        res.status(500).json({ message: "Could not delete habit" })
    } finally {
        connection.release()
    }
}
