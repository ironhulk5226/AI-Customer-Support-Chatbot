
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generateRAGAnswer,
    generateRAGAnswerStream,
} from "../services/ragService.js";
import {
    normalizeUserQuery,
    translateAnswer,
} from "../services/translationService.js";

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
    try {
        const { message, language = "en" } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required.",
            });
        }

        const supportedLanguages = ["en", "hi", "mr"];

        if (!supportedLanguages.includes(language)) {
            return res.status(400).json({
                message: "Unsupported language.",
            });
        }

        // 1. Detect input language/style and normalize query to English
        const normalizedQuery = await normalizeUserQuery(message.trim());

        console.log("Original query:", message.trim());
        console.log(
            "Detected language:",
            normalizedQuery.detectedLanguage
        );
        console.log(
            "Input style:",
            normalizedQuery.inputStyle
        );
        console.log(
            "Normalized English query:",
            normalizedQuery.englishText
        );

        /*
         * Hindi / Marathi:
         * Use the normal RAG response instead of streaming.
         *
         * Flow:
         * User query
         * -> Normalize to English
         * -> RAG
         * -> Generate complete English answer
         * -> Translate complete answer
         * -> Return JSON
         */
        if (language !== "en") {
            const result = await generateRAGAnswer(
                normalizedQuery.englishText,
                3
            );

            let finalAnswer = result.answer || "";

            if (finalAnswer.trim()) {
                finalAnswer = await translateAnswer(
                    finalAnswer,
                    language,
                    normalizedQuery.inputStyle
                );
            }

            return res.status(200).json({
                answer: finalAnswer,
                language,
                sources: result.sources || [],
            });
        }

        /*
         * English:
         * Continue using the existing streaming RAG pipeline.
         */
        const result = await generateRAGAnswerStream(
            normalizedQuery.englishText,
            3
        );

        // If no stream is available, return normal fallback
        if (!result.stream) {
            return res.status(200).json({
                answer:
                    "The information is not available in the knowledge base.",
                language,
                sources: [],
            });
        }

        // 2. Prepare safe source information
        const sources = (result.sources || []).map((source) => ({
            document:
                source.documentName ||
                source.document ||
                source.name ||
                "",
            section:
                source.section ||
                (source.chunkIndex !== undefined
                    ? `Knowledge Base Chunk ${source.chunkIndex + 1}`
                    : ""),
            evidence: source.evidence || "",
        }));

        // 3. Configure Server-Sent Events
        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );
        res.setHeader(
            "Cache-Control",
            "no-cache"
        );
        res.setHeader(
            "Connection",
            "keep-alive"
        );
        res.setHeader(
            "X-Accel-Buffering",
            "no"
        );

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        // Send sources before answer streaming starts
        
        res.write(
            `event: sources\ndata: ${JSON.stringify({
                sources,
                language,
            })}\n\n`
        );

        let completeAnswer = "";

        try {
            for await (const chunk of result.stream) {
                const text =
                    typeof chunk === "string"
                        ? chunk
                        : chunk?.message?.content || "";

                if (!text) {
                    continue;
                }

                completeAnswer += text;

                res.write(
                    `event: token\ndata: ${JSON.stringify({
                        text,
                    })}\n\n`
                );
            }

            // Send final English answer
            console.log("FINAL STREAMED ANSWER:", completeAnswer);
            res.write(
                `event: complete\ndata: ${JSON.stringify({
                    answer: completeAnswer,
                    language,
                    sources,
                })}\n\n`
            );
        } catch (streamError) {
            console.error(
                "LLM streaming failed:",
                streamError.message
            );

            res.write(
                `event: error\ndata: ${JSON.stringify({
                    message:
                        "Failed while generating the response.",
                })}\n\n`
            );
        }

        res.end();
    } catch (error) {
        console.error(
            "Chat request failed:",
            error.message
        );

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Failed to process chat request.",
            });
        }

        res.end();
    }
});

export default router;

