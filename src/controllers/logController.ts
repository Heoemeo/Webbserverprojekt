import { Request, Response } from "express";
import { Log } from "../models/mongo"

//get logs from Mongodb
export const getLogs = async (req: Request, res: Response) => {

    const logs = await Log.find()

    res.json(logs)
}

//create new log
export const createLog = async (req: Request, res: Response) => {

    const log = await Log.create(req.body)

    res.json(log)
}

//update a log
export const updateLog = async (req: Request, res: Response) => {
    const {id} = req.params
    const log = await Log.findByIdAndUpdate(id, req.body, {
        new: true
    })
    res.json(log)
}

//delete a log
export const deleteLog = async (req: Request, res: Response) => {
    const {id} = req.params

    await Log.findByIdAndDelete(id)

    res.json({message: "The log was deleted"})
}
