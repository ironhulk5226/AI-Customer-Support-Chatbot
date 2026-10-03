import express from "express";
import Conversation from "../models/Conversation.js";
import Document from "../models/Document.js";
import FAQ from "../models/FAQ.js";
import KnowledgeGap from "../models/KnowledgeGap.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const recurrenceThreshold = Number.isInteger(
            Number.parseInt(process.env.KNOWLEDGE_GAP_RECURRENCE_THRESHOLD, 10),
        )
            ? Number.parseInt(process.env.KNOWLEDGE_GAP_RECURRENCE_THRESHOLD, 10)
            : 3;

        const [
            totalUsers,
            totalConversations,
            totalDocuments,
            totalFaqs,
            candidateGaps,
            approvedFaqs,
            conversationStats,
            languageStats,
            dailyStats,
            documentStats,
            faqStats,
            feedbackStats,
        ] = await Promise.all([
            User.countDocuments({ role: "customer" }),
            Conversation.countDocuments(),
            Document.countDocuments(),
            FAQ.countDocuments(),
            KnowledgeGap.countDocuments({
                status: "candidate",
                occurrenceCount: { $gte: recurrenceThreshold },
            }),
            FAQ.countDocuments({ status: "approved" }),
            Conversation.aggregate([
                {
                    $project: {
                        messageCount: { $size: "$messages" },
                        updatedAt: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: "$messageCount" },
                        activeToday: {
                            $sum: {
                                $cond: [{ $gte: ["$updatedAt", startOfToday] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
            Conversation.aggregate([
                { $unwind: "$messages" },
                {
                    $group: {
                        _id: "$messages.language",
                        messages: { $sum: 1 },
                    },
                },
                { $sort: { messages: -1 } },
            ]),
            Conversation.aggregate([
                { $unwind: "$messages" },
                { $match: { "messages.timestamp": { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$messages.timestamp",
                            },
                        },
                        messages: { $sum: 1 },
                        conversations: { $addToSet: "$_id" },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        messages: 1,
                        conversations: { $size: "$conversations" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Document.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            FAQ.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Conversation.aggregate([
                { $unwind: "$messages" },
                { $match: { "messages.feedback": { $in: ["helpful", "not_helpful"] } } },
                {
                    $group: {
                        _id: "$messages.feedback",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const stats = conversationStats[0] || { totalMessages: 0, activeToday: 0 };
        const feedback = feedbackStats.reduce(
            (result, item) => ({ ...result, [item._id]: item.count }),
            { helpful: 0, not_helpful: 0 },
        );

        return res.json({
            generatedAt: now.toISOString(),
            totals: {
                users: totalUsers,
                conversations: totalConversations,
                messages: stats.totalMessages,
                activeToday: stats.activeToday,
                documents: totalDocuments,
                faqs: totalFaqs,
                candidateGaps,
                totalKnowledgeGaps: candidateGaps,
                approvedFaqs,
            },
            languages: languageStats,
            daily: dailyStats,
            documents: documentStats,
            faqs: faqStats,
            feedback,
        });
    } catch (error) {
        console.error("Admin analytics could not be loaded:", error.message);

        return res.status(500).json({
            message: "Unable to load admin analytics.",
        });
    }
});

export default router;
