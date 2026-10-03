import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        language: {
            type: String,
            enum: ["en", "hi", "mr"],
            default: "en",
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },

        sources: {
            type: [
                {
                    name: {
                        type: String,
                        default: "",
                    },

                    document: {
                        type: String,
                        default: "",
                    },

                    section: {
                        type: String,
                        default: "",
                    },

                    evidence: {
                        type: String,
                        default: "",
                    },
                },
            ],
            default: [],
        },

        feedback: {
            type: String,
            enum: ["helpful", "not_helpful", null],
            default: null,
        },
    },
    {
        _id: true,
    },
);

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
        },

        messages: {
            type: [messageSchema],
            default: [],
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    },
);

/*
 * Mongoose save middleware.
 *
 * Do not use next() here.
 * The current Mongoose version supports the async/promise
 * middleware style.
 */
conversationSchema.pre("save", async function () {
    this.updatedAt = new Date();
});

const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);

export default Conversation;