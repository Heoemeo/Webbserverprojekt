import mongoose from "mongoose"

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("MongoDB connected")
    } catch (error) {
        console.error("MongoDB connection error:", error)
    }
}

const logSchema = new mongoose.Schema({
    habit_id: Number,
    date: Date,
    completed: Boolean
})

export const Log = mongoose.model("Log", logSchema)
