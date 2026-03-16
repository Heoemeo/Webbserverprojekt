import mongoose from "mongoose"

//connect to MongoDB
mongoose.connect("mongodb://localhost:27017/habit_logs")


//structure of a log document
const logSchema = new mongoose.Schema({
    habit_id: Number,
    date: Date,
    completed: Boolean
})

//create a model based on schema
export const Log = mongoose.model("Log", logSchema)
