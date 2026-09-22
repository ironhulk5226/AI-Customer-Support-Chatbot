import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set. Check server/.env and how the server is started.");
        }

        await mongoose.connect(mongoUri);
        console.log("MongoDB connected Successfully!")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
        
    }
}

export default connectDB;