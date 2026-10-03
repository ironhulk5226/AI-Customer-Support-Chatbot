import express from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeMessages = (messages = []) => {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages
        .filter((message) => message && message.content !== undefined)
        .map((message) => ({
            role: message.role === "assistant" ? "assistant" : "user",
            content: String(message.content || ""),
            language: ["en", "hi", "mr"].includes(message.language)
                ? message.language
                : "en",
            timestamp: message.timestamp || new Date().toISOString(),
            sources: Array.isArray(message.sources) ? message.sources : [],
            feedback: message.feedback || null,
        }));
};

const getTitleFromMessage = (message) => {
    const raw = String(message || "").trim();

    if (!raw) {
        return "New conversation";
    }

    return raw.length > 60
        ? `${raw.slice(0, 57).trim()}...`
        : raw;
};

const buildConversationPayload = (conversation) => ({
    _id: conversation._id,
    userId: conversation.userId,
    title: conversation.title,
    messages: conversation.messages || [],
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
});

router.use(protect);

router.get("/", async (req, res) => {
    try {
        const userId = req.user.userId.toString();

        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(20);

        return res.status(200).json({
            conversations: conversations.map(buildConversationPayload),
        });
    } catch (error) {
        console.error("Load conversations failed:", error.message);

        return res.status(500).json({
            message: "Unable to load conversations.",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const userId = req.user.userId.toString();

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid conversation ID.",
            });
        }

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId,
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found.",
            });
        }

        return res.status(200).json({
            conversation: buildConversationPayload(conversation),
        });
    } catch (error) {
        console.error("Load conversation failed:", error.message);

        return res.status(500).json({
            message: "Unable to load conversation.",
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const { messages = [], conversationId } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "Conversation messages are required.",
            });
        }

        const normalizedMessages = normalizeMessages(messages);

        if (normalizedMessages.length === 0) {
            return res.status(400).json({
                message: "Valid conversation messages are required.",
            });
        }

        const firstUserMessage =
            normalizedMessages.find((message) => message.role === "user")
                ?.content || "New conversation";

        const title = getTitleFromMessage(firstUserMessage);

        if (conversationId) {
            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    message: "Invalid conversation ID.",
                });
            }

            const conversation = await Conversation.findOne({
                _id: conversationId,
                userId,
            });

            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found.",
                });
            }

            conversation.title = title;
            conversation.messages = normalizedMessages;
            conversation.updatedAt = new Date();

            await conversation.save();

            return res.status(200).json({
                conversation: buildConversationPayload(conversation),
            });
        }

        const conversation = new Conversation({
            userId,
            title,
            messages: normalizedMessages,
        });

        await conversation.save();

        return res.status(201).json({
            conversation: buildConversationPayload(conversation),
        });
    } catch (error) {
        console.error("Save conversation failed:", error.message);

        return res.status(500).json({
            message: "Unable to save conversation.",
        });
    }
});

export default router;