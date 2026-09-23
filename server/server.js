import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use("/",healthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/translate", translationRoutes);

connectDB();

app.get("/",(req,res)=>{
    res.json({
        message:"Server is running"
    })
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});