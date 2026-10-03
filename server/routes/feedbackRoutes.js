import express from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const allowedFeedbackValues = new Set(["helpful", "not_helpful"]);

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { conversationId, messageId, feedback } = req.body || {};

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "A valid conversationId is required.",
      });
    }

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        message: "A valid messageId is required.",
      });
    }

    if (!allowedFeedbackValues.has(feedback)) {
      return res.status(400).json({
        message: "Feedback must be helpful or not_helpful.",
      });
    }

    const userId = req.user.userId.toString();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const message = conversation.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    if (message.role !== "assistant") {
      return res.status(400).json({
        message: "Feedback can only be submitted for assistant messages.",
      });
    }

    message.feedback = feedback;
    conversation.updatedAt = new Date();

    await conversation.save();

    return res.status(200).json({
      success: true,
      conversationId,
      messageId,
      feedback,
    });
  } catch (error) {
    console.error("Feedback submission failed:", error.message);

    return res.status(500).json({
      message: "Unable to save feedback.",
    });
  }
});

export default router;
