import { getVectorStoreStats } from "../services/vectorStoreService.js";

export const getVectorStoreStatistics = async(req,res)=>{
    try {
        const stats = await getVectorStoreStats();

        res.status(200).json({
            message:"Vector Store Stats Fetched Successfully",
            stats
        });
    } catch (error) {
        console.error("Vector Store Stats error:", error.message);
        res.status(500).json({
            message:"Failed to fetch vector store stats"
        })
    }
}