import mongoose from "mongoose";

const connectDB = async()=>{
    if (!process.env.MONGODB_URI) {
        console.warn("MongoDB URI not configured. Continuing without database connection.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected Successfully!")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

export default connectDB;