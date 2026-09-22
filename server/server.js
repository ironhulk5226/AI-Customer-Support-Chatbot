import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes.js";
import documentRoutes from "./routes/documentRoutes.js"
import vectorStoreRoutes from "./routes/vectorStoreRoutes.js"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use("/",healthRoutes);
app.use("/api/documents",documentRoutes);
app.use("/api/vector-store",vectorStoreRoutes);

connectDB();

app.get("/",(req,res)=>{
    res.json({
        message:"Server is running"
    })
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});