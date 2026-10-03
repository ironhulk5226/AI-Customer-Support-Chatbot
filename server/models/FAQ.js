import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },

        answer: {
            type: String,
            required: true,
            trim: true,
        },

        sourceKnowledgeGap: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "KnowledgeGap",
            default: null,
        },

        status: {
            type: String,
            enum: ["draft", "approved", "rejected"],
            default: "draft",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        embeddingStatus: {
            type: String,
            enum: ["not_added", "added", "failed"],
            default: "not_added",
        },

        embeddingAddedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;