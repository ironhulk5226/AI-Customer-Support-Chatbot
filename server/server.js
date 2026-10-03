import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes.js";
import documentRoutes from "./routes/documentRoutes.js"
import vectorStoreRoutes from "./routes/vectorStoreRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import knowledgeGapRoutes from "./routes/knowledgeGapRoutes.js";
import speechRoutes from "./routes/speechRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use("/",healthRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/knowledge-gaps", knowledgeGapRoutes);
app.use(
    "/api/speech",
    express.raw({
        type: [
            "audio/webm",
            "audio/ogg",
            "audio/wav",
            "audio/mpeg",
            "audio/mp4",
        ],
        limit: "25mb",
    }),
    speechRoutes
);
app.use("/api/documents",documentRoutes);
app.use("/api/vector-store",vectorStoreRoutes);
app.use("/api/faqs", faqRoutes);

connectDB();

app.get("/",(req,res)=>{
    res.json({
        message:"Server is running"
    })
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});