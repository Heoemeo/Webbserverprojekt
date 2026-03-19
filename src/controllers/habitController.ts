import { Request, Response } from "express";
import { db } from "../models/mysql";
import { title } from "node:process";

//Get all habits from mysql
export const getHabits = async (req: Request, res: Response) => {
    const [rows] = await db.query("SELECT * FROM habits")
    res.json(rows)
}
//Create a new habit
export const createHabit = async (req: Request, res: Response) => {
    const { title, description } = req.body

    //new habit to database
    await db.query(
        "INSERT INTO habits (title, description) VALUES (?, ?)",
        [title, description]
    )
    res.json({message: "habit created"})
}

//Update habit
export const updateHabit = async (req: Request, res: Response) => {
    //get id from url
    const {id} = req.params

    const {title, description} = req.body

    //update habit in database
    await db.query(
        "UPDATE habits SET title=?, description=? WHERE id=?",
        [title, description,id]

    )
    res.json({message:"Habit updated"})

}

//Delete a habit
export const deleteHabit = async (req: Request, res: Response) => {
    const {id} = req.params

    //delete habit from database
    await db.query("DELETE FROM habits WHERE id=?", [id])

    res.json({message: "The habit was deleted"})
}
