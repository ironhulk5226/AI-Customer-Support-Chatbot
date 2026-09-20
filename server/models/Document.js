import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        originalFileName: {
            type: String,
            required: true,
            trim: true
        },

        fileType: {
            type: String,
            required: true,
            enum: ["pdf", "docx"]
        },

        fileSize: {
            type: Number,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["uploaded", "processing", "processed", "failed"],
            default: "uploaded"
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        }
    },
    {
        timestamps: true
    }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;