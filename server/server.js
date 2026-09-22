import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use("/",healthRoutes);
app.use("/api/auth", authRoutes);

connectDB();

app.get("/",(req,res)=>{
    res.json({
        message:"Server is running"
    })
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});