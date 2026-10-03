import FAQ from "../models/FAQ.js";
import { generateFAQDraft } from "../services/faqService.js";
import { generateEmbedding } from "../services/embeddingService.js";
import { addDocumentsToVectorStore } from "../services/vectorStoreService.js";
import KnowledgeGap from "../models/KnowledgeGap.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .populate(
        "sourceKnowledgeGap",
        "originalQuestion occurrenceCount recurrenceStatus",
      )
      .populate("createdBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      faqs,
    });
  } catch (error) {
    console.error("Failed to fetch FAQs:", error.message);

    return res.status(500).json({
      message: "Failed to fetch FAQs.",
    });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, sourceKnowledgeGap } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "FAQ question is required.",
      });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        message: "FAQ answer is required.",
      });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      sourceKnowledgeGap: sourceKnowledgeGap || null,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "FAQ draft created successfully.",
      faq,
    });
  } catch (error) {
    console.error("Failed to create FAQ:", error.message);

    return res.status(500).json({
      message: "Failed to create FAQ.",
    });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    if (!["draft", "approved"].includes(faq.status)) {
      return res.status(400).json({
        message: "Only draft or approved FAQs can be edited.",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "FAQ question is required.",
      });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        message: "FAQ answer is required.",
      });
    }

    const updatedQuestion = question.trim();
    const updatedAnswer = answer.trim();

    /*
     * Draft FAQ:
     * Only update MongoDB.
     * It does not exist in ChromaDB yet.
     */
    if (faq.status === "draft") {
      faq.question = updatedQuestion;
      faq.answer = updatedAnswer;

      await faq.save();

      return res.json({
        message: "FAQ updated successfully.",
        faq,
      });
    }

    /*
     * Approved FAQ:
     * The FAQ is already part of ChromaDB.
     * Generate a new embedding and replace the existing
     * FAQ vector using the same deterministic vector ID.
     */
    const oldQuestion = faq.question;
    const oldAnswer = faq.answer;

    const oldFaqText = `${oldQuestion.trim()}\n${oldAnswer.trim()}`;
    const newFaqText = `${updatedQuestion}\n${updatedAnswer}`;

    try {
      const embedding = await generateEmbedding(newFaqText);

      const faqVectorId = `faq_${faq._id.toString()}`;

      await addDocumentsToVectorStore({
        ids: [faqVectorId],
        documents: [newFaqText],
        embeddings: [embedding],
        metadatas: [
          {
            faqId: faq._id.toString(),
            type: "faq",
            document: "Approved FAQ",
            section: "FAQ",
            evidence: updatedAnswer,
            question: updatedQuestion,
          },
        ],
      });

      /*
       * Update MongoDB only after the new vector has
       * successfully been written to ChromaDB.
       */
      faq.question = updatedQuestion;
      faq.answer = updatedAnswer;
      faq.embeddingStatus = "added";
      faq.embeddingAddedAt = new Date();

      await faq.save();

      return res.json({
        message: "Approved FAQ updated and knowledge base refreshed successfully.",
        faq,
      });
    } catch (embeddingError) {
      console.error(
        "Approved FAQ embedding update failed:",
        embeddingError.message,
      );

      /*
       * The existing MongoDB FAQ remains unchanged.
       * The existing ChromaDB vector also remains unchanged
       * if the new embedding/upsert failed.
       */
      return res.status(500).json({
        message:
          "Unable to update the approved FAQ because the knowledge base could not be updated.",
      });
    }
  } catch (error) {
    console.error("Failed to update FAQ:", error.message);

    return res.status(500).json({
      message: "Failed to update FAQ.",
    });
  }
};

export const rejectFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    if (faq.status !== "draft") {
      return res.status(400).json({
        message: "Only draft FAQs can be rejected.",
      });
    }

    faq.status = "rejected";
    faq.reviewedBy = req.user.userId;
    faq.reviewedAt = new Date();

    await faq.save();

    return res.json({
      message: "FAQ rejected successfully.",
      faq,
    });
  } catch (error) {
    console.error("Failed to reject FAQ:", error.message);

    return res.status(500).json({
      message: "Failed to reject FAQ.",
    });
  }
};

export const generateFAQ = async (req, res) => {
  try {
    const { question, sourceKnowledgeGap } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required.",
      });
    }

    /*
     * Prevent duplicate active FAQs for the same
     * knowledge gap.
     *
     * A knowledge gap can have:
     * - one draft FAQ waiting for review, or
     * - one approved FAQ already in the knowledge base.
     *
     * Rejected FAQs are intentionally excluded so that
     * the administrator can generate a new draft later.
     */
    if (sourceKnowledgeGap) {
      const existingFAQ = await FAQ.findOne({
        sourceKnowledgeGap,
        status: {
          $in: ["draft", "approved"],
        },
      });

      if (existingFAQ) {
        return res.status(409).json({
          message:
            existingFAQ.status === "approved"
              ? "An approved FAQ already exists for this knowledge gap."
              : "An FAQ draft already exists for this knowledge gap.",
          faq: existingFAQ,
        });
      }
    }

    const generatedFAQ = await generateFAQDraft(
      question.trim(),
    );

    const faq = await FAQ.create({
      question: generatedFAQ.question,
      answer: generatedFAQ.answer,
      sourceKnowledgeGap: sourceKnowledgeGap || null,
      createdBy: req.user.userId,
      status: "draft",
      embeddingStatus: "not_added",
    });

    return res.status(201).json({
      message: "FAQ draft generated successfully.",
      faq,
    });
  } catch (error) {
    console.error(
      "Failed to generate FAQ draft:",
      error.message,
    );

    return res.status(500).json({
      message: "Failed to generate FAQ draft.",
    });
  }
};

export const approveFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    if (faq.status === "approved") {
      return res.status(400).json({
        message: "FAQ is already approved.",
      });
    }

    if (!faq.question?.trim() || !faq.answer?.trim()) {
      return res.status(400).json({
        message: "FAQ question and answer are required before approval.",
      });
    }

    const faqText = `${faq.question.trim()}\n${faq.answer.trim()}`;

    const embedding = await generateEmbedding(faqText);

    const faqVectorId = `faq_${faq._id.toString()}`;

    await addDocumentsToVectorStore({
      ids: [faqVectorId],
      documents: [faqText],
      embeddings: [embedding],
      metadatas: [
        {
          faqId: faq._id.toString(),
          type: "faq",
          document: "Approved FAQ",
          section: "FAQ",
          evidence: faq.answer.trim(),
          question: faq.question.trim(),
        },
      ],
    });

    faq.status = "approved";
    faq.reviewedBy = req.user.userId;
    faq.reviewedAt = new Date();
    faq.embeddingStatus = "added";
    faq.embeddingAddedAt = new Date();

    await faq.save();

    if (faq.sourceKnowledgeGap) {
      await KnowledgeGap.findByIdAndUpdate(faq.sourceKnowledgeGap, {
        status: "resolved",
      });
    }

    return res.status(200).json({
      message: "FAQ approved and added to the knowledge base.",
      faq,
    });
  } catch (error) {
    console.error("FAQ approval failed:", error);

    try {
      const faq = await FAQ.findById(req.params.id);

      if (faq) {
        faq.embeddingStatus = "failed";
        await faq.save();
      }
    } catch (updateError) {
      console.error("Failed to update FAQ embedding status:", updateError);
    }

    return res.status(500).json({
      message: "Failed to approve FAQ and update the knowledge base.",
    });
  }
};
