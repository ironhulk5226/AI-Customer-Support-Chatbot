import express from 'express';
const router = express.Router();

router.get("/" , (req,res)=>{
    res.json({
        message:"AI Customer Support Chatbot API is running"
    });
});

export default router;
