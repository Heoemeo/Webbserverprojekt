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
    // Vilken användare loggen tillhör
    user_id: {
        type: Number,
        required: true
    },

    // Vilken habit som loggades
    habit_id: {
        type: Number,
        required: true
    },

    // Datum när habiten loggades
    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    // Om habiten är genomförd
    completed: {
        type: Boolean,
        required: true,
        default: true
    }
})

export const Log = mongoose.model("Log", logSchema)
